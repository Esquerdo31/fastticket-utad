"use server";

import prisma from "../../lib/prisma";
import { getSession } from "../../lib/session";

interface LoteInput {
    nome: string;
    descricao?: string;
    preco: number;
    lotacaoTotal: number;
}

interface CreateEventoInput {
    titulo: string;
    descricao: string;
    dataInicio: string;
    dataFim?: string;
    localizacao: string;
    organizadorId: number;
    lotes: LoteInput[];
    bannerUrl?: string;
    thumbnailUrl?: string;
    formato?: string;
    categoria?: string;
    estado?: string;
    mostrarBanner?: boolean;
    mostrarLogo?: boolean;
}

export async function createEvento(data: CreateEventoInput) {
    try {
        if (!data.titulo || !data.descricao || !data.dataInicio || !data.localizacao) {
            return { success: false, message: "Campos obrigatórios em falta." };
        }
        if (!data.lotes || data.lotes.length === 0) {
            return { success: false, message: "É necessário pelo menos um lote de bilhetes." };
        }

        const lotacaoMaxima = data.lotes.reduce((sum, l) => sum + l.lotacaoTotal, 0);

        const evento = await prisma.evento.create({
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                dataInicio: new Date(data.dataInicio),
                dataFim: data.dataFim ? new Date(data.dataFim) : null,
                localizacao: data.localizacao,
                lotacaoMaxima,
                formato: data.formato || "presencial",
                categoria: data.categoria || "Conferência",
                estado: data.estado || "RASCUNHO",
                bannerUrl: data.bannerUrl || null,
                thumbnailUrl: data.thumbnailUrl || null,
                mostrarBanner: data.mostrarBanner ?? true,
                mostrarLogo: data.mostrarLogo ?? true,
                organizadorId: data.organizadorId,
                lotes: {
                    create: data.lotes.map(lote => ({
                        nome: lote.nome,
                        descricao: lote.descricao || null,
                        preco: lote.preco,
                        lotacaoTotal: lote.lotacaoTotal,
                        quantidadeDisponivel: lote.lotacaoTotal,
                    })),
                },
            },
        });

        return { success: true, message: "Evento criado com sucesso!", eventoId: evento.id };
    } catch (error: any) {
        console.error("Erro ao criar evento:", error);
        return { success: false, message: `Erro ao criar evento: ${error.message}` };
    }
}

export async function getEventoById(eventoId: number) {
    try {
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId },
            include: { lotes: true },
        });
        if (!evento) return { success: false, message: "Evento não encontrado." };

        return {
            success: true,
            data: {
                id: evento.id,
                titulo: evento.titulo,
                descricao: evento.descricao,
                dataInicio: evento.dataInicio.toISOString().slice(0, 16),
                dataFim: evento.dataFim ? evento.dataFim.toISOString().slice(0, 16) : '',
                localizacao: evento.localizacao,
                lotacaoMaxima: evento.lotacaoMaxima,
                organizadorId: evento.organizadorId,
                formato: evento.formato,
                categoria: evento.categoria,
                estado: evento.estado,
                bannerUrl: evento.bannerUrl || '',
                thumbnailUrl: evento.thumbnailUrl || '',
                mostrarBanner: evento.mostrarBanner,
                mostrarLogo: evento.mostrarLogo,
                lotes: evento.lotes.map(l => ({
                    id: l.id,
                    nome: l.nome,
                    descricao: l.descricao || '',
                    preco: l.preco,
                    lotacaoTotal: l.lotacaoTotal,
                })),
            },
        };
    } catch (error: any) {
        return { success: false, message: `Erro: ${error.message}` };
    }
}

export async function updateEvento(eventoId: number, data: CreateEventoInput) {
    try {
        if (!data.titulo || !data.descricao || !data.dataInicio || !data.localizacao) {
            return { success: false, message: "Campos obrigatórios em falta." };
        }
        if (!data.lotes || data.lotes.length === 0) {
            return { success: false, message: "É necessário pelo menos um lote de bilhetes." };
        }

        const lotacaoMaxima = data.lotes.reduce((sum, l) => sum + l.lotacaoTotal, 0);

        // Delete existing lots and recreate them
        await prisma.loteBilhete.deleteMany({ where: { eventoId } });

        await prisma.evento.update({
            where: { id: eventoId },
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                dataInicio: new Date(data.dataInicio),
                dataFim: data.dataFim ? new Date(data.dataFim) : null,
                localizacao: data.localizacao,
                lotacaoMaxima,
                formato: data.formato || "presencial",
                categoria: data.categoria || "Conferência",
                estado: data.estado,
                bannerUrl: data.bannerUrl || null,
                thumbnailUrl: data.thumbnailUrl || null,
                mostrarBanner: data.mostrarBanner ?? true,
                mostrarLogo: data.mostrarLogo ?? true,
                lotes: {
                    create: data.lotes.map(lote => ({
                        nome: lote.nome,
                        descricao: lote.descricao || null,
                        preco: lote.preco,
                        lotacaoTotal: lote.lotacaoTotal,
                        quantidadeDisponivel: lote.lotacaoTotal,
                    })),
                },
            },
        });

        return { success: true, message: "Evento atualizado com sucesso!" };
    } catch (error: any) {
        console.error("Erro ao atualizar evento:", error);
        return { success: false, message: `Erro ao atualizar evento: ${error.message}` };
    }
}

export async function deleteEvento(eventoId: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, message: "Não autenticado." };

        const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
        if (!evento) return { success: false, message: "Evento não encontrado." };
        if (evento.organizadorId !== session.userId) {
            return { success: false, message: "Sem permissão para apagar este evento." };
        }

        // Delete related records first
        await prisma.loteBilhete.deleteMany({ where: { eventoId } });
        await prisma.evento.delete({ where: { id: eventoId } });

        return { success: true, message: "Evento apagado com sucesso." };
    } catch (error: any) {
        console.error("Erro ao apagar evento:", error);
        return { success: false, message: `Erro: ${error.message}` };
    }
}
