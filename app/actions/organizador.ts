"use server";

import prisma from "../../lib/prisma";
import * as bcrypt from "bcryptjs";
import { getSession } from "../../lib/session";

export async function getOrganizerDashboardData(userId: number) {
    try {
        const userObj = await prisma.utilizador.findUnique({
            where: { id: userId },
            select: { pedidoPromotores: true } as any
        });

        const eventos = await prisma.evento.findMany({
            where: { organizadorId: userId },
            include: {
                lotes: {
                    include: {
                        bilhetes: {
                            where: { estado: 'PAGO' }
                        }
                    }
                }
            },
            orderBy: { dataInicio: 'asc' }
        });

        let totalBilhetesVendidos = 0;
        let receitaTotal = 0;
        let totalCapacity = 0;
        
        const eventosStats = eventos.map(evento => {
            let eventoBilhetesVendidos = 0;
            let eventoReceita = 0;
            
            const lotesStats = evento.lotes.map(lote => {
                const vendidos = lote.bilhetes.length;
                eventoBilhetesVendidos += vendidos;
                eventoReceita += vendidos * lote.preco;
                totalCapacity += lote.lotacaoTotal;
                
                return {
                    id: lote.id,
                    nome: lote.nome,
                    tipo: (lote as any).tipo,
                    preco: lote.preco,
                    lotacaoTotal: lote.lotacaoTotal,
                    quantidadeDisponivel: lote.quantidadeDisponivel,
                    bilhetesVendidos: vendidos,
                    receita: vendidos * lote.preco
                };
            });
            
            totalBilhetesVendidos += eventoBilhetesVendidos;
            receitaTotal += eventoReceita;
            
            return {
                id: evento.id,
                titulo: evento.titulo,
                dataInicio: evento.dataInicio.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                localizacao: evento.localizacao,
                lotacaoMaxima: evento.lotacaoMaxima,
                bilhetesVendidos: eventoBilhetesVendidos,
                receita: eventoReceita,
                lotes: lotesStats
            };
        });

        // 1. Timezone-robust upcoming events filter
        const todayStart = new Date();
        const formatter = new Intl.DateTimeFormat('pt-PT', {
            timeZone: 'Europe/Lisbon',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = formatter.formatToParts(todayStart);
        const year = Number(parts.find(p => p.type === 'year')?.value);
        const month = Number(parts.find(p => p.type === 'month')?.value) - 1;
        const day = Number(parts.find(p => p.type === 'day')?.value);
        const todayMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0));

        const nextEvents = eventosStats.filter(e => {
            const ev = eventos.find(ex => ex.id === e.id);
            if (!ev) return false;
            const fim = ev.dataFim ? new Date(ev.dataFim) : new Date(ev.dataInicio);
            return fim.getTime() >= todayMidnight.getTime();
        }).slice(0, 3);

        // 2. Fetch last 15 days of daily sales
        const fifteenDaysAgo = new Date(todayMidnight);
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14);

        const ordersLast15Days = await prisma.pedido.findMany({
            where: {
                estado: 'PAGO',
                dataPedido: { gte: fifteenDaysAgo },
                bilhetes: {
                    some: {
                        lote: {
                            evento: {
                                organizadorId: userId
                            }
                        }
                    }
                }
            },
            select: {
                dataPedido: true,
                valorTotal: true,
                bilhetes: {
                    select: { id: true }
                }
            }
        });

        // Map sales trend for the last 15 days
        const salesMap: Record<string, { count: number, revenue: number }> = {};
        for (let i = 14; i >= 0; i--) {
            const d = new Date(todayMidnight);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
            salesMap[dateStr] = { count: 0, revenue: 0 };
        }

        ordersLast15Days.forEach(order => {
            const orderDateStr = order.dataPedido.toLocaleDateString('pt-PT', { 
                timeZone: 'Europe/Lisbon', 
                day: '2-digit', 
                month: 'short' 
            });
            if (salesMap[orderDateStr] !== undefined) {
                salesMap[orderDateStr].count += order.bilhetes.length;
                salesMap[orderDateStr].revenue += order.valorTotal;
            }
        });

        const salesByDate = Object.entries(salesMap).map(([date, data]) => ({
            date,
            count: data.count,
            revenue: data.revenue
        }));

        // 3. Promoters statistics leaderboard
        const promotores = await prisma.promotor.findMany({
            where: {
                evento: { organizadorId: userId }
            },
            include: {
                utilizador: { select: { nome: true } },
                evento: { select: { titulo: true } },
                pedidosGerados: {
                    where: { estado: 'PAGO' },
                    include: { bilhetes: true }
                }
            }
        });

        const promoterLeaderboard = promotores.map(p => {
            let totalSales = 0;
            let totalRevenue = 0;
            let commissionEarned = 0;

            p.pedidosGerados.forEach(order => {
                const numTickets = order.bilhetes.length;
                totalSales += numTickets;
                totalRevenue += order.valorTotal;

                if (p.comissaoValor !== null && p.comissaoValor !== undefined) {
                    commissionEarned += numTickets * p.comissaoValor;
                } else if (p.comissaoPercent !== null && p.comissaoPercent !== undefined) {
                    commissionEarned += order.valorTotal * (p.comissaoPercent / 100);
                }
            });

            return {
                id: p.id,
                slug: p.linkSlug,
                name: p.utilizador.nome,
                eventoTitulo: p.evento.titulo,
                salesCount: totalSales,
                revenue: totalRevenue,
                commissionEarned: commissionEarned
            };
        }).sort((a, b) => b.salesCount - a.salesCount);

        // Obter os 10 últimos pedidos pagos referentes a eventos deste organizador
        const recentOrders = await prisma.pedido.findMany({
            where: {
                estado: 'PAGO',
                bilhetes: {
                    some: {
                        lote: {
                            evento: {
                                organizadorId: userId
                            }
                        }
                    }
                }
            },
            include: {
                utilizador: {
                    select: { nome: true, email: true }
                },
                promotor: {
                    select: {
                        linkSlug: true,
                        utilizador: { select: { nome: true } }
                    }
                },
                bilhetes: {
                    include: {
                        lote: {
                            include: {
                                evento: {
                                    select: { titulo: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { dataPedido: 'desc' },
            take: 10
        });

        const recentPurchases = recentOrders.map(order => {
            const ticketSummary: Record<string, number> = {};
            let eventoTitulo = "";
            
            order.bilhetes.forEach(b => {
                ticketSummary[b.lote.nome] = (ticketSummary[b.lote.nome] || 0) + 1;
                if (!eventoTitulo) {
                    eventoTitulo = b.lote.evento.titulo;
                }
            });
            
            const ticketsDesc = Object.entries(ticketSummary)
                .map(([name, qty]) => `${qty}x ${name}`)
                .join(', ');

            return {
                id: order.id,
                compradorNome: order.utilizador.nome,
                compradorEmail: order.utilizador.email,
                data: order.dataPedido.toLocaleString('pt-PT', { 
                    timeZone: 'Europe/Lisbon',
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                valor: order.valorTotal,
                ticketsDesc,
                eventoTitulo,
                promotorSlug: order.promotor?.linkSlug || null,
                promotorNome: order.promotor?.utilizador.nome || null
            };
        });

        return {
            success: true,
            pedidoPromotores: (userObj as any)?.pedidoPromotores || 'NADA',
            summary: {
                totalEventos: eventos.length,
                totalBilhetesVendidos,
                receitaTotal,
                totalCapacity
            },
            eventos: eventosStats,
            nextEvents,
            recentPurchases,
            salesByDate,
            promoterLeaderboard
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function criarStaff(data: {
    nome: string;
    email: string;
    passwordField: string;
    eventoId: number;
}) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        // Verificar se o organizador é dono do evento
        const evento = await prisma.evento.findFirst({
            where: { id: data.eventoId, organizadorId: session.userId }
        });
        if (!evento) {
            return { success: false, message: 'Evento não encontrado ou não pertence a esta conta.' };
        }

        // Verificar se utilizador com este email já existe
        let user = await prisma.utilizador.findUnique({
            where: { email: data.email }
        });

        if (user) {
            if (user.role !== 'STAFF') {
                return { success: false, message: 'Este e-mail pertence a um utilizador que não é do tipo Staff.' };
            }
        } else {
            // Criar nova conta de staff
            const hashedPassword = await bcrypt.hash(data.passwordField, 10);
            user = await prisma.utilizador.create({
                data: {
                    nome: data.nome,
                    email: data.email,
                    passwordHash: hashedPassword,
                    role: 'STAFF'
                }
            });
        }

        // Verificar se já está associado a este evento
        const existeAssociacao = await prisma.eventoStaff.findUnique({
            where: {
                eventoId_staffId: {
                    eventoId: data.eventoId,
                    staffId: user.id
                }
            }
        });

        if (existeAssociacao) {
            return { success: false, message: 'Este staff já está associado a este evento.' };
        }

        // Criar associação
        await prisma.eventoStaff.create({
            data: {
                eventoId: data.eventoId,
                staffId: user.id
            }
        });

        return { success: true, message: 'Staff criado e associado ao evento com sucesso!' };
    } catch (error: any) {
        console.error('Erro ao criar staff:', error);
        return { success: false, message: error.message || 'Erro interno ao criar staff.' };
    }
}

export async function getStaffEquipa() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, staffList: [] };
        }

        // Procurar todos os staffs vinculados aos eventos deste organizador
        const staffEquipa = await prisma.eventoStaff.findMany({
            where: {
                evento: {
                    organizadorId: session.userId
                }
            },
            include: {
                staff: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                evento: {
                    select: {
                        id: true,
                        titulo: true
                    }
                }
            },
            orderBy: {
                evento: {
                    titulo: 'asc'
                }
            }
        });

        const staffList = staffEquipa.map(es => ({
            id: es.staff.id,
            nome: es.staff.nome,
            email: es.staff.email,
            eventoId: es.evento.id,
            eventoTitulo: es.evento.titulo,
            eventoStaffId: es.id
        }));

        return { success: true, staffList };
    } catch (error: any) {
        console.error('Erro ao listar staff:', error);
        return { success: false, staffList: [] };
    }
}

export async function removerStaff(staffId: number, eventoId: number) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        // Verificar se o organizador é dono do evento
        const evento = await prisma.evento.findFirst({
            where: { id: eventoId, organizadorId: session.userId }
        });
        if (!evento) {
            return { success: false, message: 'Não autorizado a remover staff deste evento.' };
        }

        // Remover associação
        await prisma.eventoStaff.delete({
            where: {
                eventoId_staffId: {
                    eventoId,
                    staffId
                }
            }
        });

        return { success: true, message: 'Staff removido do evento com sucesso!' };
    } catch (error: any) {
        console.error('Erro ao remover staff:', error);
        return { success: false, message: error.message || 'Erro interno.' };
    }
}

export async function solicitarAcessoPromotores() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        await prisma.utilizador.update({
            where: { id: session.userId },
            data: { pedidoPromotores: 'PENDENTE' } as any
        });

        return { success: true, message: 'Pedido enviado com sucesso para aprovação do administrador!' };
    } catch (error: any) {
        console.error('Erro ao solicitar acesso a promotores:', error);
        return { success: false, message: error.message || 'Erro ao processar o pedido.' };
    }
}
