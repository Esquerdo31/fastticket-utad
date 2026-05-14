"use server";

import prisma from "../../lib/prisma";

export async function getOrganizerDashboardData(userId: number) {
    try {
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
        
        const eventosStats = eventos.map(evento => {
            let eventoBilhetesVendidos = 0;
            let eventoReceita = 0;
            
            evento.lotes.forEach(lote => {
                const vendidos = lote.bilhetes.length;
                eventoBilhetesVendidos += vendidos;
                eventoReceita += vendidos * lote.preco;
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
                receita: eventoReceita
            };
        });

        const nextEvents = eventosStats.filter(e => {
            const ev = eventos.find(ex => ex.id === e.id);
            return ev && ev.dataInicio >= new Date();
        }).slice(0, 3);

        return {
            success: true,
            summary: {
                totalEventos: eventos.length,
                totalBilhetesVendidos,
                receitaTotal
            },
            eventos: eventosStats,
            nextEvents
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
