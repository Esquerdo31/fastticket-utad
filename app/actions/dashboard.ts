"use server";

import prisma from "../../lib/prisma";

export async function getDashboardData(userId: number) {
    try {
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

        const nextEvents = Array.from(myEventsMap.values()).map(ev => {
            const dateStr = ev.dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
            return {
                id: ev.id,
                title: ev.title,
                location: ev.location,
                date: dateStr,
                day: ev.dateObj.toLocaleDateString('pt-PT', { day: '2-digit' }),
                month: ev.dateObj.toLocaleDateString('pt-PT', { month: 'short' }),
                time: ev.dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
            };
        });

        // 3. Recomendados (Top 3 futuros cronologicamente)
        const recomendacoes = await prisma.evento.findMany({
            take: 3,
            orderBy: { dataInicio: 'asc' }, // Recomendamos os mais urgentes
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
                date: dateStr
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
