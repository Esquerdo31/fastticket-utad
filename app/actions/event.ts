"use server";

import prisma from "../../lib/prisma";

export async function getEventos() {
    try {
        const eventos = await prisma.evento.findMany({
            include: {
                lotes: true,
                organizador: {
                    select: {
                        nome: true
                    }
                }
            },
            orderBy: {
                dataInicio: 'asc'
            }
        });
        
        // Vamos transformar as Datas complexas em strings mais fáceis de usar no UI e calcular o preço mínimo
        const formattedEventos = eventos.map(ev => {
            const dataObj = new Date(ev.dataInicio);
            // ex: "15 Out, 2024 • 09:00"
            const dateStr = dataObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = dataObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

            const precos = ev.lotes.map(l => l.preco);
            const minPrice = precos.length > 0 ? Math.min(...precos) : 0;
            const priceStr = minPrice === 0 ? "Gratuito" : `${minPrice.toFixed(2)}€`;

            return {
                id: ev.id,
                title: ev.titulo,
                description: ev.descricao,
                date: `${dateStr} • ${timeStr}`,
                location: ev.localizacao,
                price: priceStr,
                category: "EVENTO",
                organizador: ev.organizador.nome,
                bannerUrl: ev.bannerUrl || null,
                thumbnailUrl: ev.thumbnailUrl || null,
                mostrarBanner: ev.mostrarBanner,
                mostrarLogo: ev.mostrarLogo,
            };
        });

        return { success: true, data: formattedEventos };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function getEventoById(id: number) {
    try {
        const ev = await prisma.evento.findUnique({
            where: { id: id },
            include: {
                lotes: true,
                organizador: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        if (!ev) {
            return { success: false, message: "Evento não encontrado" };
        }

        const dataObj = new Date(ev.dataInicio);
        const dateStr = dataObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = dataObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

        return { 
            success: true, 
            data: {
                id: ev.id,
                title: ev.titulo,
                description: ev.descricao,
                date: `${dateStr} • ${timeStr}`,
                location: ev.localizacao,
                organizador: ev.organizador.nome,
                category: "EVENTO",
                bannerUrl: ev.bannerUrl || null,
                thumbnailUrl: ev.thumbnailUrl || null,
                mostrarBanner: ev.mostrarBanner,
                mostrarLogo: ev.mostrarLogo,
                lotes: ev.lotes.map(l => ({
                    id: l.id,
                    name: l.nome,
                    description: l.descricao || "",
                    price: l.preco === 0 ? "Gratuito" : `${l.preco.toFixed(2)}€`,
                    lotacaoTotal: l.lotacaoTotal,
                    quantidadeDisponivel: l.quantidadeDisponivel,
                    esgotado: l.quantidadeDisponivel === 0
                }))
            } 
        };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
