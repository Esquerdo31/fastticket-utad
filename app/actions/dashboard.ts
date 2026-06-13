"use server";

import prisma from "../../lib/prisma";
import { gerarQRCodeBase64 } from "../../lib/qrcode";
import { getSession } from "../../lib/session";

export async function getDashboardData(userId: number) {
    try {
        const session = await getSession();
        if (!session || session.userId !== userId) {
            return { success: false, message: "Não autorizado." };
        }

        // 1. Obter Nome do Utilizador
        const user = await prisma.utilizador.findUnique({
            where: { id: userId },
            select: { nome: true }
        });

        // 2. Procurar Bilhetes Pagos futuros (Próximos Eventos)
        const compras = await prisma.pedido.findMany({
            where: {
                utilizadorId: userId,
                estado: 'PAGO'
            },
            include: {
                bilhetes: {
                    include: {
                        lote: {
                            include: {
                                evento: true
                            }
                        }
                    }
                }
            }
        });

        // 2.1 Mapear compras em eventos únicos (Se comprou dois bilhetes pro mesmo evento, agrupar)
        const myEventsMap = new Map();
        for (const pedido of compras) {
            for (const bilhete of pedido.bilhetes) {
                const ev = bilhete.lote.evento;
                if (!myEventsMap.has(ev.id)) {
                    myEventsMap.set(ev.id, {
                        id: ev.id,
                        title: ev.titulo,
                        location: ev.localizacao,
                        dateObj: new Date(ev.dataInicio),
                    });
                }
            }
        }

        const nextEvents = await Promise.all(Array.from(myEventsMap.values()).map(async ev => {
            const dateStr = ev.dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });

            // Get all tickets of the user for this event
            const eventTickets = compras.flatMap(p => p.bilhetes)
                .filter(b => b.lote.eventoId === ev.id);

            const ticketsWithQR = await Promise.all(eventTickets.map(async b => {
                const qrCodeBase64 = await gerarQRCodeBase64(b.qrCodeToken);
                const evDb = b.lote.evento as any;
                return {
                    id: b.id,
                    qrCodeToken: b.qrCodeToken,
                    qrCodeBase64,
                    loteNome: b.lote.nome,
                    estado: b.estado,
                    preco: b.lote.preco,
                    eventoTitulo: evDb.titulo,
                    eventoLocal: evDb.localizacao,
                    eventoData: ev.dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                    eventoHora: ev.dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                    ticketCorFundo: evDb.ticketCorFundo || "#ffffff",
                    ticketCorTexto: evDb.ticketCorTexto || "#000000",
                    ticketMensagem: evDb.ticketMensagem || "Apresente este bilhete impresso ou no telemóvel na entrada do recinto.",
                    ticketBackgroundUrl: evDb.ticketBackgroundUrl || null,
                    ticketTemplate: evDb.ticketTemplate || "classic",
                    ticketLogoUrl: evDb.ticketLogoUrl || null,
                    ticketGlow: evDb.ticketGlow ?? false,
                    participanteNome: user?.nome || "Participante",
                };
            }));

            return {
                id: ev.id,
                title: ev.title,
                location: ev.location,
                date: dateStr,
                day: ev.dateObj.toLocaleDateString('pt-PT', { day: '2-digit' }),
                month: ev.dateObj.toLocaleDateString('pt-PT', { month: 'short' }),
                time: ev.dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                tickets: ticketsWithQR
            };
        }));

        // 3. Recomendados (Top 3 ativos/publicados)
        const recomendacoes = await prisma.evento.findMany({
            where: {
                estado: 'PUBLICADO'
            },
            take: 3,
            orderBy: { dataInicio: 'asc' }, // Recomendamos por ordem cronológica
            include: {
                lotes: true
            }
        });

        const suggestedEvents = recomendacoes.map(ev => {
            const dateObj = new Date(ev.dataInicio);
            const dateStr = dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
            return {
                id: ev.id,
                title: ev.titulo,
                description: ev.descricao,
                date: dateStr,
                bannerUrl: ev.bannerUrl || null
            };
        });

        return {
            success: true,
            userName: user?.nome || "Participante",
            nextEvents,
            suggestedEvents
        };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
