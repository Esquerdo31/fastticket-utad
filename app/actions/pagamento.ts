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
        let finalUserId: number;

        // 1. Verificar autenticação
        const session = await getSession();
        if (!session) {
            if (!data.guestEmail || !data.guestName) {
                return { success: false, message: 'Não autenticado. Para comprar como convidado, forneça o seu nome e e-mail.' };
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.guestEmail)) {
                return { success: false, message: 'Formato de e-mail inválido.' };
            }
            if (data.guestName.trim().length < 2) {
                return { success: false, message: 'O nome deve ter pelo menos 2 caracteres.' };
            }
            if (data.guestPassword && data.guestPassword.length < 6) {
                return { success: false, message: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
            }

            const existingUser = await prisma.utilizador.findUnique({
                where: { email: data.guestEmail.trim().toLowerCase() }
            });

            if (existingUser) {
                return { success: false, message: 'Este e-mail já se encontra registado. Por favor, inicie sessão para concluir a compra.' };
            }

            const hashedPassword = data.guestPassword && data.guestPassword.trim().length >= 6
                ? await bcrypt.hash(data.guestPassword.trim(), 10)
                : await bcrypt.hash(crypto.randomUUID(), 10);

            const guestUser = await prisma.utilizador.create({
                data: {
                    nome: data.guestName.trim(),
                    email: data.guestEmail.trim().toLowerCase(),
                    passwordHash: hashedPassword,
                    role: 'PARTICIPANTE'
                }
            });

            finalUserId = guestUser.id;

            // Iniciar sessão automaticamente para o redirecionamento funcionar com o cookie correto
            await createSession(guestUser.id, guestUser.email, guestUser.nome, guestUser.role);
        } else {
            if (session.role === 'ORGANIZADOR' || session.role === 'STAFF' || session.role === 'ADMIN') {
                return { success: false, message: 'Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.' };
            }
            finalUserId = session.userId;
        }

        // 2. Validar dados com Zod (ignoring actualQuantity/promotorSlug for this strict parse or omitting it)
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

        let finalUserId: number;

        const session = await getSession();
        if (!session) {
            if (!data.guestEmail || !data.guestName) {
                return { success: false, message: 'Não autenticado. Para comprar como convidado, forneça o seu nome e e-mail.' };
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.guestEmail)) {
                return { success: false, message: 'Formato de e-mail inválido.' };
            }
            if (data.guestName.trim().length < 2) {
                return { success: false, message: 'O nome deve ter pelo menos 2 caracteres.' };
            }
            if (data.guestPassword && data.guestPassword.length < 6) {
                return { success: false, message: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
            }

            const existingUser = await prisma.utilizador.findUnique({
                where: { email: data.guestEmail.trim().toLowerCase() }
            });

            if (existingUser) {
                return { success: false, message: 'Este e-mail já se encontra registado. Por favor, inicie sessão para concluir a compra.' };
            }

            const hashedPassword = data.guestPassword && data.guestPassword.trim().length >= 6
                ? await bcrypt.hash(data.guestPassword.trim(), 10)
                : await bcrypt.hash(crypto.randomUUID(), 10);

            const guestUser = await prisma.utilizador.create({
                data: {
                    nome: data.guestName.trim(),
                    email: data.guestEmail.trim().toLowerCase(),
                    passwordHash: hashedPassword,
                    role: 'PARTICIPANTE'
                }
            });

            finalUserId = guestUser.id;

            // Iniciar sessão automaticamente
            await createSession(guestUser.id, guestUser.email, guestUser.nome, guestUser.role);
        } else {
            if (session.role === 'ORGANIZADOR' || session.role === 'STAFF' || session.role === 'ADMIN') {
                return { success: false, message: 'Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.' };
            }
            finalUserId = session.userId;
        }

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

        // 2. Procurar o lote para saber o preço
        const lote = await prisma.loteBilhete.findUnique({
            where: { id: data.loteId }
        });
        if (!lote) {
            return { success: false, message: 'Lote de bilhetes não encontrado.' };
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
