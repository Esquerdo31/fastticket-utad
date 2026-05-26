"use server";

import prisma from "../../lib/prisma";
import { getActiveSession } from "./auth";

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
            totalLotes: e._count.lotes,
            estado: e.estado // Pass the event state to admin dashboard
        }));

        return { success: true, eventos: formattedEvents };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function aprovarEvento(eventoId: number) {
    try {
        const session = await getActiveSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, message: 'Não autorizado.' };
        }
        await prisma.evento.update({
            where: { id: eventoId },
            data: { estado: 'PUBLICADO' }
        });
        return { success: true, message: 'Evento aprovado e publicado com sucesso!' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function rejeitarEvento(eventoId: number) {
    try {
        const session = await getActiveSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, message: 'Não autorizado.' };
        }
        await prisma.evento.update({
            where: { id: eventoId },
            data: { estado: 'RASCUNHO' }
        });
        return { success: true, message: 'Evento rejeitado/revertido para rascunho!' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function alterarUserRole(userId: number, newRole: 'PARTICIPANTE' | 'ORGANIZADOR' | 'STAFF' | 'ADMIN') {
    try {
        const session = await getActiveSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, message: 'Não autorizado.' };
        }
        await prisma.utilizador.update({
            where: { id: userId },
            data: { role: newRole }
        });
        return { success: true, message: `Perfil do utilizador alterado para ${newRole}!` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function exportarRelatorioGlobal() {
    try {
        const session = await getActiveSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, message: 'Não autorizado.' };
        }

        const [users, events, orders] = await Promise.all([
            prisma.utilizador.findMany({ select: { nome: true, email: true, role: true } }),
            prisma.evento.findMany({ include: { organizador: { select: { nome: true } } } }),
            prisma.pedido.findMany({
                where: { estado: 'PAGO' },
                include: { utilizador: { select: { nome: true } } }
            })
        ]);

        let csv = '\uFEFF'; // UTF-8 BOM
        csv += '--- RELATÓRIO GLOBAL DO ECOSSISTEMA FASTTICKET ---\n';
        csv += `Data de Emissão: ${new Date().toLocaleString('pt-PT')}\n\n`;

        csv += '--- UTILIZADORES ---\n';
        csv += 'Nome;Email;Cargo\n';
        users.forEach(u => {
            csv += `"${u.nome}";"${u.email}";"${u.role}"\n`;
        });

        csv += '\n--- EVENTOS ---\n';
        csv += 'Título;Organizador;Localização;Lotação Máxima;Estado\n';
        events.forEach(e => {
            csv += `"${e.titulo}";"${e.organizador.nome}";"${e.localizacao}";${e.lotacaoMaxima};"${e.estado}"\n`;
        });

        csv += '\n--- PEDIDOS PAGOS ---\n';
        csv += 'ID Pedido;Cliente;Valor Total;Data\n';
        orders.forEach(o => {
            csv += `${o.id};"${o.utilizador.nome}";${o.valorTotal.toFixed(2)}€;"${o.dataPedido.toLocaleString('pt-PT')}"\n`;
        });

        return { success: true, csvContent: csv };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getPendingPromoterRequests() {
    try {
        const session = await getActiveSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, message: 'Não autorizado.', requests: [] };
        }

        const requests = await prisma.utilizador.findMany({
            where: {
                role: 'ORGANIZADOR',
                pedidoPromotores: 'PENDENTE'
            },
            select: {
                id: true,
                nome: true,
                email: true,
                pedidoPromotores: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        return { success: true, requests };
    } catch (error: any) {
        console.error('Erro ao obter pedidos de promotores pendentes:', error);
        return { success: false, message: error.message, requests: [] };
    }
}

export async function avaliarPedidoPromotores(userId: number, aprovado: boolean) {
    try {
        const session = await getActiveSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, message: 'Não autorizado.' };
        }

        const novoEstado = aprovado ? 'APROVADO' : 'REJEITADO';

        await prisma.utilizador.update({
            where: { id: userId },
            data: { pedidoPromotores: novoEstado }
        });

        return { success: true, message: `Pedido de promotores ${aprovado ? 'aprovado' : 'recusado'} com sucesso!` };
    } catch (error: any) {
        console.error('Erro ao avaliar pedido de promotores:', error);
        return { success: false, message: error.message };
    }
}
