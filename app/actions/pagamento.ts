"use server";

import Stripe from 'stripe';
import { z } from 'zod';
import { getSession, createSession } from '../../lib/session';
import prisma from '../../lib/prisma';
import * as bcrypt from 'bcryptjs';

// ==========================================
// Inicialização do Stripe
// ==========================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ==========================================
// Schema de Validação (Zod)
// ==========================================
const checkoutSchema = z.object({
    nomeBilhete: z.string().min(1, 'O nome do bilhete é obrigatório.'),
    preco: z.number().positive('O preço deve ser positivo.'),
    quantidade: z.number().int().positive('A quantidade deve ser um número inteiro positivo.'),
    eventoId: z.number().int().positive('O ID do evento é obrigatório.'),
    loteId: z.number().int().positive('O ID do lote é obrigatório.'),
});

// ==========================================
// Helper: Resolver ou criar utilizador guest (U3 — código extraído)
// ==========================================
async function resolveUserId(guestData?: {
    guestEmail?: string;
    guestName?: string;
    guestPassword?: string;
}): Promise<{ userId: number } | { error: string }> {
    const session = await getSession();

    if (session) {
        if (session.role === 'ORGANIZADOR' || session.role === 'STAFF' || session.role === 'ADMIN') {
            return { error: 'Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.' };
        }
        return { userId: session.userId };
    }

    // Fluxo de convidado
    if (!guestData?.guestEmail || !guestData?.guestName) {
        return { error: 'Não autenticado. Para comprar como convidado, forneça o seu nome e e-mail.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestData.guestEmail)) {
        return { error: 'Formato de e-mail inválido.' };
    }
    if (guestData.guestName.trim().length < 2) {
        return { error: 'O nome deve ter pelo menos 2 caracteres.' };
    }
    if (guestData.guestPassword && guestData.guestPassword.length < 6) {
        return { error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    const existingUser = await prisma.utilizador.findUnique({
        where: { email: guestData.guestEmail.trim().toLowerCase() }
    });

    if (existingUser) {
        return { error: 'Este e-mail já se encontra registado. Por favor, inicie sessão para concluir a compra.' };
    }

    const hashedPassword = guestData.guestPassword && guestData.guestPassword.trim().length >= 6
        ? await bcrypt.hash(guestData.guestPassword.trim(), 10)
        : await bcrypt.hash(crypto.randomUUID(), 10);

    const guestUser = await prisma.utilizador.create({
        data: {
            nome: guestData.guestName.trim(),
            email: guestData.guestEmail.trim().toLowerCase(),
            passwordHash: hashedPassword,
            role: 'PARTICIPANTE'
        }
    });

    // Iniciar sessão automaticamente para o redirecionamento funcionar com o cookie correto
    await createSession(guestUser.id, guestUser.email, guestUser.nome, guestUser.role);
    return { userId: guestUser.id };
}

// ==========================================
// Helper: Validar período de vendas do lote (U2)
// ==========================================
function validarPeriodoVendas(lote: any): string | null {
    const now = new Date();

    if (lote.vendaInicio && new Date(lote.vendaInicio) > now) {
        const dataStr = new Date(lote.vendaInicio).toLocaleDateString('pt-PT', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        return `As vendas para o lote "${lote.nome}" ainda não abriram. Início das vendas: ${dataStr}.`;
    }

    if (lote.vendaFim && new Date(lote.vendaFim) < now) {
        return `O período de vendas para o lote "${lote.nome}" já terminou.`;
    }

    return null; // Período válido
}

// ==========================================
// Server Action — Criar Sessão de Checkout Stripe
// Adaptado do pagamentoController.ts do Rafa
// ==========================================

/**
 * Cria uma sessão de pagamento no Stripe Checkout.
 * O utilizador é redirecionado para a página do Stripe para completar o pagamento.
 */
export async function criarSessaoCheckout(data: {
    nomeBilhete: string;
    preco: number;
    quantidade: number;
    eventoId: number;
    loteId: number;
    actualQuantity?: number;
    promotorSlug?: string;
    guestEmail?: string;
    guestName?: string;
    guestPassword?: string;
}) {
    try {
        // 1. Resolver utilizador (autenticado ou guest)
        const userResult = await resolveUserId(data);
        if ('error' in userResult) {
            return { success: false, message: userResult.error };
        }
        const finalUserId = userResult.userId;

        // 2. Validar dados com Zod
        const parseResult = checkoutSchema.safeParse(data);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const { nomeBilhete, preco, quantidade, eventoId, loteId } = parseResult.data;
        const finalQuantityToMint = data.actualQuantity || quantidade;

        // Verificar se o evento está suspenso
        const dbEvento = await prisma.evento.findUnique({
            where: { id: eventoId }
        });
        if (!dbEvento) {
            return { success: false, message: 'Evento não encontrado.' };
        }
        if (dbEvento.estado === 'SUSPENSO') {
            return { success: false, message: 'Este evento encontra-se temporariamente suspenso. Não é possível comprar bilhetes.' };
        }

        // Verificar período de vendas do lote (U2)
        const lote = await prisma.loteBilhete.findUnique({ where: { id: loteId } });
        if (!lote) {
            return { success: false, message: 'Lote de bilhetes não encontrado.' };
        }
        const periodoErro = validarPeriodoVendas(lote);
        if (periodoErro) {
            return { success: false, message: periodoErro };
        }

        // Procurar o ID do promotor se houver slug
        let promotorId = "";
        if (data.promotorSlug) {
            const promotor = await prisma.promotor.findUnique({
                where: { linkSlug: data.promotorSlug },
            });
            if (promotor && promotor.eventoId === eventoId && promotor.estado === 'ACEITE') {
                promotorId = promotor.id.toString();
            }
        }

        // 3. Converter preço para cêntimos (Stripe trabalha em cêntimos)
        const precoEmCentimos = Math.round(preco * 100);

        // 4. Criar sessão Stripe Checkout
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        unit_amount: precoEmCentimos,
                        product_data: {
                            name: nomeBilhete,
                        },
                    },
                    quantity: quantidade, // Usually 1 to bundle fees
                },
            ],
            metadata: {
                userId: finalUserId.toString(),
                eventoId: eventoId.toString(),
                loteId: loteId.toString(),
                quantidade: finalQuantityToMint.toString(),
                promotorId: promotorId,
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?pagamento=sucesso`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?pagamento=cancelado`,
        });

        return {
            success: true,
            url: stripeSession.url,
            sessionId: stripeSession.id,
        };
    } catch (error: any) {
        console.error('[Pagamento] Erro ao criar sessão Stripe:', error);
        return { success: false, message: `Erro ao processar pagamento: ${error.message}` };
    }
}

/**
 * Simula um pagamento bem-sucedido em ambiente de desenvolvimento.
 * Desvia o Stripe e gera os bilhetes diretamente chamando o webhook interno.
 */
export async function simularPagamento(data: {
    eventoId: number;
    loteId: number;
    quantidade: number;
    promotorSlug?: string;
    guestEmail?: string;
    guestName?: string;
    guestPassword?: string;
}) {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return { success: false, message: 'A simulação de pagamentos só é permitida em ambiente de desenvolvimento.' };
        }

        // 1. Resolver utilizador (autenticado ou guest)
        const userResult = await resolveUserId(data);
        if ('error' in userResult) {
            return { success: false, message: userResult.error };
        }
        const finalUserId = userResult.userId;

        // Verificar se o evento está suspenso
        const dbEvento = await prisma.evento.findUnique({
            where: { id: data.eventoId }
        });
        if (!dbEvento) {
            return { success: false, message: 'Evento não encontrado.' };
        }
        if (dbEvento.estado === 'SUSPENSO') {
            return { success: false, message: 'Este evento encontra-se temporariamente suspenso. Não é possível comprar bilhetes.' };
        }

        // 1. Procurar o ID do promotor se houver slug
        let promotorId: number | undefined = undefined;
        if (data.promotorSlug) {
            const promotor = await prisma.promotor.findUnique({
                where: { linkSlug: data.promotorSlug },
            });
            if (promotor && promotor.eventoId === data.eventoId && promotor.estado === 'ACEITE') {
                promotorId = promotor.id;
            }
        }

        // 2. Procurar o lote para saber o preço e validar período de vendas
        const lote = await prisma.loteBilhete.findUnique({
            where: { id: data.loteId }
        });
        if (!lote) {
            return { success: false, message: 'Lote de bilhetes não encontrado.' };
        }

        // Verificar período de vendas do lote (U2)
        const periodoErro = validarPeriodoVendas(lote);
        if (periodoErro) {
            return { success: false, message: periodoErro };
        }

        const valorTotal = lote.preco * data.quantidade;
        const fakePaymentIntentId = `fake_pi_${crypto.randomUUID()}`;

        // 3. Chamar diretamente o processador de pagamentos do webhook
        const { processarPagamentoWebhook } = await import('../../lib/ticketsInternal');
        const res = await processarPagamentoWebhook({
            userId: finalUserId,
            eventoId: data.eventoId,
            loteId: data.loteId,
            quantidade: data.quantidade,
            promotorId: promotorId,
        }, fakePaymentIntentId, valorTotal);

        return res;
    } catch (error: any) {
        console.error('[Pagamento] Erro ao simular pagamento:', error);
        return { success: false, message: `Erro ao simular pagamento: ${error.message}` };
    }
}
