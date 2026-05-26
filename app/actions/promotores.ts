"use server";

import prisma from "../../lib/prisma";
import { getSession } from "../../lib/session";

export async function getPromotoresPorEvento(eventoId: number) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        const promotores = await prisma.promotor.findMany({
            where: { eventoId },
            include: {
                utilizador: {
                    select: { nome: true, email: true }
                },
                pedidosGerados: {
                    where: { estado: 'PAGO' },
                    include: { bilhetes: true }
                }
            }
        });

        // Map and calculate leaderboard stats
        const data = promotores.map(p => {
            const bilhetesVendidos = p.pedidosGerados.reduce((acc, pedido) => acc + pedido.bilhetes.length, 0);
            const receitaGerada = p.pedidosGerados.reduce((acc, pedido) => acc + pedido.valorTotal, 0);
            
            // Calculate commission
            let comissaoTotal = 0;
            if (p.comissaoPercent) {
                comissaoTotal = receitaGerada * (p.comissaoPercent / 100);
            } else if (p.comissaoValor) {
                comissaoTotal = bilhetesVendidos * p.comissaoValor;
            }

            return {
                id: p.id,
                nome: p.utilizador.nome,
                email: p.utilizador.email,
                linkSlug: p.linkSlug,
                comissaoValor: p.comissaoValor,
                comissaoPercent: p.comissaoPercent,
                estado: p.estado,
                bilhetesVendidos,
                receitaGerada,
                comissaoTotal
            };
        });

        // Sort by bilhetesVendidos descending
        data.sort((a, b) => b.bilhetesVendidos - a.bilhetesVendidos);

        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function adicionarPromotor(eventoId: number, email: string, slug: string, comissaoValor: number | null, comissaoPercent: number | null) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        // Find user by email
        const user = await prisma.utilizador.findUnique({ where: { email } });
        if (!user) {
            return { success: false, message: 'Nenhum utilizador encontrado com este e-mail. Peça-lhe para criar conta primeiro.' };
        }

        // Create promoter (defaults to PENDENTE)
        const promotor = await prisma.promotor.create({
            data: {
                eventoId,
                utilizadorId: user.id,
                linkSlug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                comissaoValor,
                comissaoPercent,
                estado: 'PENDENTE'
            }
        });

        return { success: true, message: 'Convite enviado com sucesso!' };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, message: 'Já existe um parceiro com este slug ou este utilizador já é parceiro neste evento.' };
        }
        return { success: false, message: error.message };
    }
}

export async function getParceriasPromotor() {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Não autenticado.' };
        }

        const parcerias = await prisma.promotor.findMany({
            where: { utilizadorId: session.userId },
            include: {
                evento: {
                    select: {
                        id: true,
                        titulo: true,
                        dataInicio: true,
                        localizacao: true,
                        estado: true,
                        lotacaoMaxima: true
                    }
                },
                pedidosGerados: {
                    where: { estado: 'PAGO' },
                    include: {
                        bilhetes: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        const data = await Promise.all(parcerias.map(async (p) => {
            const bilhetesVendidos = p.pedidosGerados.reduce((acc, pedido) => acc + pedido.bilhetes.length, 0);
            const receitaGerada = p.pedidosGerados.reduce((acc, pedido) => acc + pedido.valorTotal, 0);

            let comissaoAcumulada = 0;
            if (p.comissaoPercent) {
                comissaoAcumulada = receitaGerada * (p.comissaoPercent / 100);
            } else if (p.comissaoValor) {
                comissaoAcumulada = bilhetesVendidos * p.comissaoValor;
            }

            // Total tickets sold overall for this event (event-wide analytics)
            const totalTicketsEvent = await prisma.bilhete.count({
                where: {
                    lote: { eventoId: p.eventoId },
                    estado: { in: ['PAGO', 'USADO'] }
                }
            });

            // Total revenue generated overall for this event (event-wide analytics)
            const totalRevenueEventResult = await prisma.pedido.aggregate({
                where: {
                    bilhetes: {
                        some: {
                            lote: { eventoId: p.eventoId }
                        }
                    },
                    estado: 'PAGO'
                },
                _sum: {
                    valorTotal: true
                }
            });
            const totalRevenueEvent = totalRevenueEventResult._sum.valorTotal || 0;

            return {
                id: p.id,
                eventoId: p.eventoId,
                eventoTitulo: p.evento.titulo,
                eventoData: p.evento.dataInicio.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                eventoLocal: p.evento.localizacao,
                eventoEstado: p.evento.estado,
                eventoLotacaoMaxima: p.evento.lotacaoMaxima,
                eventoBilhetesVendidos: totalTicketsEvent,
                eventoReceitaTotal: totalRevenueEvent,
                linkSlug: p.linkSlug,
                comissaoValor: p.comissaoValor,
                comissaoPercent: p.comissaoPercent,
                estado: p.estado,
                bilhetesVendidos,
                receitaGerada,
                comissaoAcumulada
            };
        }));

        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function responderConvitePromotor(promotorId: number, aceitar: boolean, customSlug?: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Não autenticado.' };
        }

        // Verify the promoter record belongs to the user
        const promotor = await prisma.promotor.findUnique({
            where: { id: promotorId }
        });

        if (!promotor || promotor.utilizadorId !== session.userId) {
            return { success: false, message: 'Convite não encontrado ou não autorizado.' };
        }

        if (promotor.estado !== 'PENDENTE') {
            return { success: false, message: 'Este convite já foi respondido.' };
        }

        if (aceitar) {
            let finalSlug = promotor.linkSlug;
            if (customSlug) {
                finalSlug = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                if (finalSlug.length < 3) {
                    return { success: false, message: 'O link personalizado deve ter pelo menos 3 caracteres.' };
                }

                // Check slug uniqueness
                const existing = await prisma.promotor.findFirst({
                    where: { linkSlug: finalSlug, id: { not: promotorId } }
                });
                if (existing) {
                    return { success: false, message: 'Este link já está a ser utilizado por outro parceiro.' };
                }
            }

            await prisma.promotor.update({
                where: { id: promotorId },
                data: {
                    estado: 'ACEITE',
                    linkSlug: finalSlug
                }
            });

            return { success: true, message: 'Convite aceite com sucesso!' };
        } else {
            await prisma.promotor.update({
                where: { id: promotorId },
                data: {
                    estado: 'REJEITADO'
                }
            });

            return { success: true, message: 'Convite recusado.' };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
