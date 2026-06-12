import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { processarPagamentoWebhook } from '../../../../lib/ticketsInternal';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature') as string;

        let event: Stripe.Event;

        // Se tivermos um secret de webhook configurado, verificamos a assinatura
        if (webhookSecret) {
            try {
                event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            } catch (err: any) {
                console.error(`[Stripe Webhook] ❌ Assinatura inválida: ${err.message}`);
                return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
            }
        } else {
            // Apenas para ambiente de desenvolvimento local (caso não passes secret)
            // NOTA: Inseguro em produção!
            event = JSON.parse(body) as Stripe.Event;
        }

        // Lidar com o evento de pagamento concluído
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Lemos a metadata que passámos em `criarSessaoCheckout`
            const metadata = session.metadata;

            if (!metadata || !metadata.userId || !metadata.loteId) {
                console.error('[Stripe Webhook] ❌ Sessão concluída mas metadata em falta.');
                return new NextResponse('OK', { status: 200 }); // Retorna 200 na mesma para o Stripe parar de tentar
            }

            const paymentIntentId = typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.id; // Fallback para ID da sessão

            const valorEuros = (session.amount_total || 0) / 100;

            console.log(`[Stripe Webhook] 💳 Pagamento recebido! A processar emissão de bilhetes...`);

            // Chama a lógica de backend que está separada do `getSession()` do cliente
            await processarPagamentoWebhook(
                {
                    userId: parseInt(metadata.userId, 10),
                    eventoId: parseInt(metadata.eventoId, 10),
                    loteId: parseInt(metadata.loteId, 10),
                    quantidade: parseInt(metadata.quantidade, 10),
                    promotorId: metadata.promotorId ? parseInt(metadata.promotorId, 10) : undefined,
                },
                paymentIntentId,
                valorEuros
            );
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error: any) {
        console.error(`[Stripe Webhook] ❌ Erro interno do servidor: ${error.message}`);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
