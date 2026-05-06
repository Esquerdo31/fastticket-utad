"use server";

import prisma from "../../lib/prisma";

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
