"use server";

import Stripe from 'stripe';
import { z } from 'zod';
import { getSession } from '../../lib/session';
import prisma from '../../lib/prisma';

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
}) {
    try {
        // 1. Verificar autenticação
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Não autenticado. Faça login primeiro.' };
        }

        if (session.role === 'ORGANIZADOR' || session.role === 'STAFF' || session.role === 'ADMIN') {
            return { success: false, message: 'Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.' };
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
                userId: session.userId.toString(),
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
