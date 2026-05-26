"use server";

import prisma from "../../lib/prisma";
import { getSession } from "../../lib/session";
import { z } from "zod";

// ==========================================
// Schemas de Validação (Zod)
// Adaptado do eventoController.ts do Rafa + campos do nosso schema
// ==========================================

const loteSchema = z.object({
    id: z.number().optional(),
    nome: z.string().min(1, 'O nome do lote é obrigatório.'),
    descricao: z.string().optional(),
    preco: z.number().min(0, 'O preço não pode ser negativo.'),
    lotacaoTotal: z.number().int().positive('A lotação total deve ser um número positivo.'),
    tipo: z.string().optional(),
    diasValidos: z.string().optional(),
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
    ticketCorFundo: z.string().optional(),
    ticketCorTexto: z.string().optional(),
    ticketMensagem: z.string().optional(),
    ticketBackgroundUrl: z.string().optional(),
    ticketTemplate: z.string().optional(),
    ticketLogoUrl: z.string().optional(),
    ticketGlow: z.boolean().optional(),
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

        const evento = await (prisma.evento.create as any)({
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
                ticketCorFundo: validated.ticketCorFundo || "#ffffff",
                ticketCorTexto: validated.ticketCorTexto || "#000000",
                ticketMensagem: validated.ticketMensagem || "Apresente este bilhete impresso ou no telemóvel na entrada do recinto.",
                ticketBackgroundUrl: validated.ticketBackgroundUrl || null,
                ticketTemplate: validated.ticketTemplate || "classic",
                ticketLogoUrl: validated.ticketLogoUrl || null,
                ticketGlow: validated.ticketGlow ?? false,
                organizadorId: validated.organizadorId,
                lotes: {
                    create: validated.lotes.map(lote => ({
                        nome: lote.nome,
                        descricao: lote.descricao || null,
                        preco: lote.preco,
                        lotacaoTotal: lote.lotacaoTotal,
                        quantidadeDisponivel: lote.lotacaoTotal,
                        tipo: lote.tipo || "DIARIO",
                        diasValidos: lote.diasValidos || "",
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
        }) as any;
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
                ticketCorFundo: evento.ticketCorFundo,
                ticketCorTexto: evento.ticketCorTexto,
                ticketMensagem: evento.ticketMensagem,
                ticketBackgroundUrl: evento.ticketBackgroundUrl || '',
                ticketTemplate: (evento as any).ticketTemplate || 'classic',
                ticketLogoUrl: (evento as any).ticketLogoUrl || '',
                ticketGlow: (evento as any).ticketGlow ?? false,
                lotes: evento.lotes.map((l: any) => ({
                    id: l.id,
                    nome: l.nome,
                    descricao: l.descricao || '',
                    preco: l.preco,
                    lotacaoTotal: l.lotacaoTotal,
                    quantidadeDisponivel: l.quantidadeDisponivel,
                    tipo: l.tipo,
                    diasValidos: l.diasValidos,
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

        // Fetch existing lots from database
        const existingLots = await prisma.loteBilhete.findMany({
            where: { eventoId },
            include: { bilhetes: true }
        });

        const incomingIds = validated.lotes.map(l => l.id).filter((id): id is number => id !== undefined);

        // Identify lots to delete
        const lotsToDelete = existingLots.filter(el => !incomingIds.includes(el.id));

        // Check if any lot to delete has sold/issued tickets
        for (const lot of lotsToDelete) {
            if (lot.bilhetes.length > 0) {
                return {
                    success: false,
                    message: `Não é possível remover o lote '${lot.nome}' porque já tem bilhetes emitidos.`
                };
            }
        }

        // Perform upserts in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete unused lots (that have no tickets)
            if (lotsToDelete.length > 0) {
                await tx.loteBilhete.deleteMany({
                    where: {
                        id: { in: lotsToDelete.map(l => l.id) }
                    }
                });
            }

            // Upsert incoming lots
            for (const lote of validated.lotes) {
                if (lote.id) {
                    // Update existing lot
                    const existing = existingLots.find(el => el.id === lote.id);
                    if (existing) {
                        const vendidos = existing.lotacaoTotal - existing.quantidadeDisponivel;
                        const novaQuantDisponivel = Math.max(0, lote.lotacaoTotal - vendidos);

                        await tx.loteBilhete.update({
                            where: { id: lote.id },
                            data: {
                                nome: lote.nome,
                                descricao: lote.descricao || null,
                                preco: lote.preco,
                                lotacaoTotal: lote.lotacaoTotal,
                                quantidadeDisponivel: novaQuantDisponivel,
                                tipo: lote.tipo || "DIARIO",
                                diasValidos: lote.diasValidos || "",
                            } as any
                        });
                    }
                } else {
                    // Create new lot
                    await tx.loteBilhete.create({
                        data: {
                            eventoId,
                            nome: lote.nome,
                            descricao: lote.descricao || null,
                            preco: lote.preco,
                            lotacaoTotal: lote.lotacaoTotal,
                            quantidadeDisponivel: lote.lotacaoTotal,
                            tipo: lote.tipo || "DIARIO",
                            diasValidos: lote.diasValidos || "",
                        } as any
                    });
                }
            }

            // Update event itself
            await (tx.evento.update as any)({
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
                    ticketCorFundo: validated.ticketCorFundo || "#ffffff",
                    ticketCorTexto: validated.ticketCorTexto || "#000000",
                    ticketMensagem: validated.ticketMensagem || "Apresente este bilhete impresso ou no telemóvel na entrada do recinto.",
                    ticketBackgroundUrl: validated.ticketBackgroundUrl || null,
                    ticketTemplate: validated.ticketTemplate || "classic",
                    ticketLogoUrl: validated.ticketLogoUrl || null,
                    ticketGlow: validated.ticketGlow ?? false,
                }
            });
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

        // Check if there are tickets sold/issued
        const ticketsCount = await prisma.bilhete.count({
            where: {
                lote: {
                    eventoId: eventoId
                }
            }
        });
        if (ticketsCount > 0) {
            return { success: false, message: "Não é possível apagar este evento porque já existem bilhetes emitidos." };
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
