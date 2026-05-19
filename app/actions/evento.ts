"use server";

import prisma from "../../lib/prisma";
import { getSession } from "../../lib/session";
import { z } from "zod";

// ==========================================
// Schemas de Validação (Zod)
// Adaptado do eventoController.ts do Rafa + campos do nosso schema
// ==========================================

const loteSchema = z.object({
    nome: z.string().min(1, 'O nome do lote é obrigatório.'),
    descricao: z.string().optional(),
    preco: z.number().min(0, 'O preço não pode ser negativo.'),
    lotacaoTotal: z.number().int().positive('A lotação total deve ser um número positivo.'),
});

const criarEventoSchema = z.object({
    titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres.'),
    descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
    dataInicio: z.string().min(1, 'A data de início é obrigatória.'),
    dataFim: z.string().optional(),
    localizacao: z.string().min(2, 'A localização é obrigatória.'),
    organizadorId: z.number().int().positive('O ID do organizador é obrigatório.'),
    lotes: z.array(loteSchema).min(1, 'É necessário pelo menos um lote de bilhetes.'),
    bannerUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    formato: z.string().optional(),
    categoria: z.string().optional(),
    estado: z.string().optional(),
    mostrarBanner: z.boolean().optional(),
    mostrarLogo: z.boolean().optional(),
});

// Tipo inferido do schema para reutilização
type CreateEventoInput = z.infer<typeof criarEventoSchema>;

// ==========================================
// Criar Evento
// ==========================================

export async function createEvento(data: CreateEventoInput) {
    try {
        // 1. Validar dados com Zod
        const parseResult = criarEventoSchema.safeParse(data);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const validated = parseResult.data;

        const lotacaoMaxima = validated.lotes.reduce((sum, l) => sum + l.lotacaoTotal, 0);

        const evento = await prisma.evento.create({
            data: {
                titulo: validated.titulo,
                descricao: validated.descricao,
                dataInicio: new Date(validated.dataInicio),
                dataFim: validated.dataFim ? new Date(validated.dataFim) : null,
                localizacao: validated.localizacao,
                lotacaoMaxima,
                formato: validated.formato || "presencial",
                categoria: validated.categoria || "Conferência",
                estado: validated.estado || "RASCUNHO",
                bannerUrl: validated.bannerUrl || null,
                thumbnailUrl: validated.thumbnailUrl || null,
                mostrarBanner: validated.mostrarBanner ?? true,
                mostrarLogo: validated.mostrarLogo ?? true,
                organizadorId: validated.organizadorId,
                lotes: {
                    create: validated.lotes.map(lote => ({
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

// ==========================================
// Obter Evento por ID
// ==========================================

export async function getEventoById(eventoId: number) {
    try {
        // Validação simples do ID
        const idResult = z.number().int().positive().safeParse(eventoId);
        if (!idResult.success) {
            return { success: false, message: "ID de evento inválido." };
        }

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

// ==========================================
// Atualizar Evento
// ==========================================

export async function updateEvento(eventoId: number, data: CreateEventoInput) {
    try {
        // 1. Validar ID
        const idResult = z.number().int().positive().safeParse(eventoId);
        if (!idResult.success) {
            return { success: false, message: "ID de evento inválido." };
        }

        // 2. Validar dados com Zod
        const parseResult = criarEventoSchema.safeParse(data);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const validated = parseResult.data;

        const lotacaoMaxima = validated.lotes.reduce((sum, l) => sum + l.lotacaoTotal, 0);

        // Delete existing lots and recreate them
        await prisma.loteBilhete.deleteMany({ where: { eventoId } });

        await prisma.evento.update({
            where: { id: eventoId },
            data: {
                titulo: validated.titulo,
                descricao: validated.descricao,
                dataInicio: new Date(validated.dataInicio),
                dataFim: validated.dataFim ? new Date(validated.dataFim) : null,
                localizacao: validated.localizacao,
                lotacaoMaxima,
                formato: validated.formato || "presencial",
                categoria: validated.categoria || "Conferência",
                estado: validated.estado,
                bannerUrl: validated.bannerUrl || null,
                thumbnailUrl: validated.thumbnailUrl || null,
                mostrarBanner: validated.mostrarBanner ?? true,
                mostrarLogo: validated.mostrarLogo ?? true,
                lotes: {
                    create: validated.lotes.map(lote => ({
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

// ==========================================
// Apagar Evento
// ==========================================

export async function deleteEvento(eventoId: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, message: "Não autenticado." };

        // Validar ID
        const idResult = z.number().int().positive().safeParse(eventoId);
        if (!idResult.success) {
            return { success: false, message: "ID de evento inválido." };
        }

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
