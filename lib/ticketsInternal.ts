import prisma from "./prisma";
import { enviarEmailBilhete } from "./email";

/**
 * Esta função é chamada pelo webhook do Stripe e simulações de pagamento de forma interna.
 * Não usa getSession() e não é exposta como Server Action.
 */
export async function processarPagamentoWebhook(metadata: {
    userId: number;
    eventoId: number;
    loteId: number;
    quantidade: number;
    promotorId?: number;
}, paymentIntentId: string, valorTotalEur: number) {
    try {
        const { userId, loteId, quantidade, promotorId } = metadata;

        // 1. Verificar se o lote existe e tem stock disponível
        const lote = await prisma.loteBilhete.findUnique({
            where: { id: loteId },
            include: { evento: true },
        });

        if (!lote) {
            console.error(`[Webhook] Lote ${loteId} não encontrado.`);
            return { success: false, message: 'Lote de bilhetes não encontrado.' };
        }

        if (lote.quantidadeDisponivel < quantidade) {
            console.error(`[Webhook] Stock insuficiente para lote ${loteId}. Quantidade pedida: ${quantidade}, disponível: ${lote.quantidadeDisponivel}`);
            return { success: false, message: `Stock insuficiente.` };
        }

        // 2. Criar Pedido + Bilhetes numa transação
        const resultado = await prisma.$transaction(async (tx) => {
            // 2.1 Criar o Pedido como PAGO
            const pedido = await tx.pedido.create({
                data: {
                    utilizadorId: userId,
                    valorTotal: valorTotalEur,
                    estado: 'PAGO',
                    promotorId: promotorId || null,
                },
            });

            // 2.2 Gravar o Pagamento (Ligação com a Transação do Stripe)
            await tx.pagamento.create({
                data: {
                    metodo: 'Stripe',
                    transacaoId: paymentIntentId,
                    pedidoId: pedido.id,
                }
            });

            // 2.3 Criar os Bilhetes com tokens únicos (QR Codes)
            const bilhetesCriados = [];
            for (let i = 0; i < quantidade; i++) {
                const token = crypto.randomUUID();
                const bilhete = await tx.bilhete.create({
                    data: {
                        qrCodeToken: token,
                        loteId: lote.id,
                        pedidoId: pedido.id,
                        estado: 'PAGO', // Já pago
                    },
                });
                bilhetesCriados.push(bilhete);
            }

            // 2.4 Decrementar stock do lote
            await tx.loteBilhete.update({
                where: { id: loteId },
                data: {
                    quantidadeDisponivel: {
                        decrement: quantidade,
                    },
                },
            });

            return { pedido, bilhetes: bilhetesCriados };
        });

        console.log(`[Webhook] ✅ Sucesso! Criados ${quantidade} bilhetes para utilizador ${userId}.`);

        // Obter os detalhes do utilizador para enviar o e-mail simulado
        const user = await prisma.utilizador.findUnique({
            where: { id: userId },
            select: { email: true, nome: true }
        });

        if (user) {
            const bilhetesFormatados = resultado.bilhetes.map(b => ({
                qrCodeToken: b.qrCodeToken,
                loteNome: lote.nome,
            }));
            await enviarEmailBilhete(user.email, user.nome, bilhetesFormatados, lote.evento);
        }

        return { success: true };
    } catch (error: any) {
        console.error('[Webhook] ❌ Erro ao processar webhook:', error);
        return { success: false, message: error.message };
    }
}
