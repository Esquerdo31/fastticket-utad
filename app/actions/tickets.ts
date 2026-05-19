"use server";

import prisma from "../../lib/prisma";
import { z } from "zod";
import { gerarQRCodeBase64 } from "../../lib/qrcode";
import { getSession } from "../../lib/session";

export async function getTicketsData(userId: number) {
    try {
        const bilhetes = await prisma.bilhete.findMany({
            where: {
                pedido: {
                    utilizadorId: userId,
                }
            },
            include: {
                lote: {
                    include: {
                        evento: true
                    }
                },
                pedido: true,
                registosAcesso: true,
            },
            orderBy: {
                pedido: {
                    dataPedido: 'desc'
                }
            }
        });

        const tickets = bilhetes.map(b => {
            const ev = b.lote.evento;
            const dateObj = new Date(ev.dataInicio);
            return {
                id: b.id,
                qrCodeToken: b.qrCodeToken,
                estado: b.estado,
                loteNome: b.lote.nome,
                preco: b.lote.preco,
                eventoId: ev.id,
                eventoTitulo: ev.titulo,
                eventoLocal: ev.localizacao,
                eventoData: dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                eventoDay: dateObj.toLocaleDateString('pt-PT', { day: '2-digit' }),
                eventoMonth: dateObj.toLocaleDateString('pt-PT', { month: 'short' }),
                eventoHora: dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                pedidoEstado: b.pedido.estado,
                dataCompra: b.pedido.dataPedido.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                usado: b.registosAcesso.length > 0,
            };
        });

        return { success: true, tickets };
    } catch (error: any) {
        return { success: false, message: error.message, tickets: [] };
    }
}

export async function getBillingData(userId: number) {
    try {
        const pedidos = await prisma.pedido.findMany({
            where: { utilizadorId: userId },
            include: {
                bilhetes: {
                    include: {
                        lote: {
                            include: {
                                evento: true
                            }
                        }
                    }
                },
                pagamento: true,
            },
            orderBy: {
                dataPedido: 'desc'
            }
        });

        const orders = pedidos.map(p => {
            // Get unique event names in this order
            const eventNames = [...new Set(p.bilhetes.map(b => b.lote.evento.titulo))];

            return {
                id: p.id,
                dataPedido: p.dataPedido.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                valorTotal: p.valorTotal,
                estado: p.estado,
                numBilhetes: p.bilhetes.length,
                eventNames,
                metodoPagamento: p.pagamento?.metodo || null,
                transacaoId: p.pagamento?.transacaoId || null,
                dataPagamento: p.pagamento?.dataPagamento
                    ? p.pagamento.dataPagamento.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
                    : null,
            };
        });

        // Calculate summary stats
        const totalGasto = pedidos
            .filter(p => p.estado === 'PAGO')
            .reduce((sum, p) => sum + p.valorTotal, 0);
        const totalPedidos = pedidos.length;
        const totalBilhetes = pedidos.reduce((sum, p) => sum + p.bilhetes.length, 0);

        return {
            success: true,
            orders,
            summary: {
                totalGasto,
                totalPedidos,
                totalBilhetes,
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message, orders: [], summary: { totalGasto: 0, totalPedidos: 0, totalBilhetes: 0 } };
    }
}

// ==========================================
// Schemas de Validação (Zod)
// ==========================================

const emitirBilheteSchema = z.object({
    eventoId: z.number().int().positive('O ID do evento é obrigatório.'),
    loteId: z.number().int().positive('O ID do lote é obrigatório.'),
    quantidade: z.number().int().min(1, 'A quantidade mínima é 1.').max(10, 'A quantidade máxima por compra é 10.'),
});

const validarBilheteSchema = z.object({
    qrCodeToken: z.string().min(1, 'O token do QR Code é obrigatório.'),
    dispositivoId: z.string().min(1, 'O ID do dispositivo é obrigatório.'),
});

// ==========================================
// Emitir Bilhete(s) com QR Code
// Adaptado do bilheteController.ts do Rafa
// ==========================================

/**
 * Emite bilhetes para um lote de um evento.
 * Cria um Pedido, gera os Bilhetes com QR Codes e decrementa o stock.
 */
export async function emitirBilhete(data: {
    eventoId: number;
    loteId: number;
    quantidade: number;
}) {
    try {
        // 1. Verificar autenticação
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Não autenticado. Faça login primeiro.' };
        }

        // 2. Validar dados com Zod
        const parseResult = emitirBilheteSchema.safeParse(data);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const { loteId, quantidade } = parseResult.data;

        // 3. Verificar se o lote existe e tem stock disponível
        const lote = await prisma.loteBilhete.findUnique({
            where: { id: loteId },
            include: { evento: true },
        });

        if (!lote) {
            return { success: false, message: 'Lote de bilhetes não encontrado.' };
        }

        if (lote.quantidadeDisponivel < quantidade) {
            return {
                success: false,
                message: `Stock insuficiente. Apenas ${lote.quantidadeDisponivel} bilhetes disponíveis.`,
            };
        }

        // 4. Calcular valor total
        const valorTotal = lote.preco * quantidade;

        // 5. Criar Pedido + Bilhetes numa transação
        const resultado = await prisma.$transaction(async (tx) => {
            // 5.1 Criar o Pedido
            const pedido = await tx.pedido.create({
                data: {
                    utilizadorId: session.userId,
                    valorTotal,
                    estado: 'PENDENTE',
                },
            });

            // 5.2 Criar os Bilhetes com tokens únicos
            const bilhetesCriados = [];
            for (let i = 0; i < quantidade; i++) {
                const token = crypto.randomUUID();
                const bilhete = await tx.bilhete.create({
                    data: {
                        qrCodeToken: token,
                        loteId: lote.id,
                        pedidoId: pedido.id,
                        estado: 'PENDENTE',
                    },
                });
                bilhetesCriados.push(bilhete);
            }

            // 5.3 Decrementar stock do lote
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

        // 6. Gerar QR Codes para cada bilhete
        const bilhetesComQR = await Promise.all(
            resultado.bilhetes.map(async (b) => ({
                id: b.id,
                qrCodeToken: b.qrCodeToken,
                qrCodeBase64: await gerarQRCodeBase64(b.qrCodeToken),
            }))
        );

        return {
            success: true,
            message: `${quantidade} bilhete(s) emitido(s) com sucesso!`,
            pedidoId: resultado.pedido.id,
            bilhetes: bilhetesComQR,
            valorTotal,
        };
    } catch (error: any) {
        console.error('[Bilhetes] Erro ao emitir bilhete:', error);
        return { success: false, message: `Erro ao emitir bilhete: ${error.message}` };
    }
}

// ==========================================
// Validar Bilhete / Check-in por QR Code
// Adaptado do bilheteController.ts do Rafa
// ==========================================

/**
 * Valida um bilhete pelo token do QR Code.
 * Verifica se existe, se já foi usado, e marca como usado (check-in).
 */
export async function validarBilhete(data: {
    qrCodeToken: string;
    dispositivoId: string;
}) {
    try {
        // 1. Verificar autenticação (deve ser staff)
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Não autenticado.' };
        }

        // 2. Validar dados com Zod
        const parseResult = validarBilheteSchema.safeParse(data);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const { qrCodeToken, dispositivoId } = parseResult.data;

        // 3. Procurar o bilhete pelo token
        const bilhete = await prisma.bilhete.findUnique({
            where: { qrCodeToken },
            include: {
                lote: {
                    include: { evento: true },
                },
                pedido: true,
                registosAcesso: true,
            },
        });

        // 3.1 Bilhete inexistente
        if (!bilhete) {
            return { success: false, message: 'Bilhete não encontrado. QR Code inválido.' };
        }

        // 3.2 Verificar se o pedido está pago
        if (bilhete.pedido.estado !== 'PAGO') {
            return { success: false, message: 'Este bilhete ainda não foi pago.' };
        }

        // 3.3 Bilhete já utilizado
        if (bilhete.estado === 'USADO') {
            return {
                success: false,
                message: '⚠️ Alerta: Este bilhete já foi utilizado!',
                alreadyUsed: true,
                usedAt: bilhete.registosAcesso[0]?.dataHoraEntrada || null,
            };
        }

        // 4. Check-in — marcar como usado e registar acesso
        await prisma.$transaction([
            prisma.bilhete.update({
                where: { id: bilhete.id },
                data: { estado: 'USADO' },
            }),
            prisma.registoAcesso.create({
                data: {
                    bilheteId: bilhete.id,
                    staffId: session.userId,
                    dispositivoId,
                },
            }),
        ]);

        return {
            success: true,
            message: '✅ Check-in efetuado com sucesso. Pode entrar!',
            bilhete: {
                id: bilhete.id,
                evento: bilhete.lote.evento.titulo,
                lote: bilhete.lote.nome,
                participanteId: bilhete.pedido.utilizadorId,
            },
        };
    } catch (error: any) {
        console.error('[Bilhetes] Erro ao validar bilhete:', error);
        return { success: false, message: `Erro ao validar bilhete: ${error.message}` };
    }
}

// ==========================================
// Webhook: Processar Pagamento Concluído
// ==========================================

/**
 * Esta função é chamada PELO STRIPE WEBHOOK de forma insegura/direta (sem sessão).
 * Por isso, não usa `getSession()` mas sim o `userId` extraído dos metadados confiáveis do Stripe.
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
            // NOTA: Em produção real, deverias fazer o refund automático no Stripe aqui
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
        return { success: true };
    } catch (error: any) {
        console.error('[Webhook] ❌ Erro ao processar webhook:', error);
        return { success: false, message: error.message };
    }
}
