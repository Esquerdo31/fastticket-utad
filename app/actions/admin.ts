"use server";

import prisma from "../../lib/prisma";

export async function getAdminDashboardData() {
    try {
        const [totalUsers, totalEventos, totalPedidos, totalReceita] = await Promise.all([
            prisma.utilizador.count(),
            prisma.evento.count(),
            prisma.pedido.count(),
            prisma.pedido.aggregate({
                _sum: {
                    valorTotal: true
                },
                where: {
                    estado: 'PAGO'
                }
            })
        ]);

        return {
            success: true,
            summary: {
                totalUsers,
                totalEventos,
                totalPedidos,
                receitaTotal: totalReceita._sum.valorTotal || 0
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getAdminUsers() {
    try {
        const users = await prisma.utilizador.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                _count: {
                    select: {
                        eventos: true,
                        pedidos: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        return { success: true, users };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getAdminEvents() {
    try {
        const eventos = await prisma.evento.findMany({
            include: {
                organizador: {
                    select: { nome: true }
                },
                _count: {
                    select: { lotes: true }
                }
            },
            orderBy: {
                dataInicio: 'desc'
            }
        });

        const formattedEvents = eventos.map(e => ({
            id: e.id,
            titulo: e.titulo,
            dataInicio: e.dataInicio.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
            localizacao: e.localizacao,
            lotacaoMaxima: e.lotacaoMaxima,
            organizadorNome: e.organizador.nome,
            totalLotes: e._count.lotes
        }));

        return { success: true, eventos: formattedEvents };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
