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
    vendaInicio: z.string().optional().nullable(),
    vendaFim: z.string().optional().nullable(),
});

const criarEventoSchema = z.object({
    titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres.'),
    descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
    dataInicio: z.string().min(1, 'A data de início é obrigatória.'),
    dataFim: z.string().min(1, 'A data de fim é obrigatória.'),
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
}).refine(data => {
    if (data.dataInicio && data.dataFim) {
        return new Date(data.dataFim) > new Date(data.dataInicio);
    }
    return true;
}, {
    message: "A data de fim deve ser posterior à data de início.",
    path: ["dataFim"]
});

// Tipo inferido do schema para reutilização
type CreateEventoInput = z.infer<typeof criarEventoSchema>;

// ==========================================
// Criar Evento
// ==========================================

export async function createEvento(data: CreateEventoInput) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ORGANIZADOR' && session.role !== 'ADMIN')) {
            return { success: false, message: 'Não autorizado.' };
        }

        // Force the owner ID to be the logged-in user's ID unless they are an admin
        const validatedInput = {
            ...data,
            organizadorId: session.role === 'ADMIN' ? data.organizadorId : session.userId
        };

        // 1. Validar dados com Zod
        const parseResult = criarEventoSchema.safeParse(validatedInput);
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
                        vendaInicio: lote.vendaInicio ? new Date(lote.vendaInicio) : null,
                        vendaFim: lote.vendaFim ? new Date(lote.vendaFim) : null,
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
        const session = await getSession();
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
                    vendaInicio: l.vendaInicio ? l.vendaInicio.toISOString().slice(0, 16) : null,
                    vendaFim: l.vendaFim ? l.vendaFim.toISOString().slice(0, 16) : null,
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
        const session = await getSession();
        if (!session || (session.role !== 'ORGANIZADOR' && session.role !== 'ADMIN')) {
            return { success: false, message: 'Não autorizado.' };
        }

        const existingEvento = await prisma.evento.findUnique({ where: { id: eventoId } });
        if (!existingEvento) {
            return { success: false, message: 'Evento não encontrado.' };
        }

        if (session.role !== 'ADMIN' && existingEvento.organizadorId !== session.userId) {
            return { success: false, message: 'Não autorizado.' };
        }

        // 1. Validar ID
        const idResult = z.number().int().positive().safeParse(eventoId);
        if (!idResult.success) {
            return { success: false, message: "ID de evento inválido." };
        }

        // Force the owner ID to be the logged-in user's ID unless they are an admin
        const validatedInput = {
            ...data,
            organizadorId: session.role === 'ADMIN' ? data.organizadorId : session.userId
        };

        // 2. Validar dados com Zod
        const parseResult = criarEventoSchema.safeParse(validatedInput);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const validated = parseResult.data;
        const lotacaoMaxima = validated.lotes.reduce((sum, l) => sum + l.lotacaoTotal, 0);

        // Check if there are tickets sold/issued for this event
        const ticketsCount = await prisma.bilhete.count({
            where: {
                lote: {
                    eventoId: eventoId
                }
            }
        });

        if (ticketsCount > 0) {
            if (validated.estado === 'RASCUNHO') {
                return {
                    success: false,
                    message: "Não é possível alterar o estado do evento para Rascunho porque já existem bilhetes vendidos."
                };
            }
            if (validated.estado === 'CANCELADO') {
                return {
                    success: false,
                    message: "Não é possível alterar o estado do evento para Cancelado diretamente. Utilize a funcionalidade de Cancelamento (Reembolso/Transferência)."
                };
            }
        }

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
                                vendaInicio: lote.vendaInicio ? new Date(lote.vendaInicio) : null,
                                vendaFim: lote.vendaFim ? new Date(lote.vendaFim) : null,
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
                            vendaInicio: lote.vendaInicio ? new Date(lote.vendaInicio) : null,
                            vendaFim: lote.vendaFim ? new Date(lote.vendaFim) : null,
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
        await prisma.promotor.deleteMany({ where: { eventoId } });
        await prisma.eventoStaff.deleteMany({ where: { eventoId } });
        await prisma.loteBilhete.deleteMany({ where: { eventoId } });
        await prisma.evento.delete({ where: { id: eventoId } });

        return { success: true, message: "Evento apagado com sucesso." };
    } catch (error: any) {
        console.error("Erro ao apagar evento:", error);
        return { success: false, message: `Erro: ${error.message}` };
    }
}

// ==========================================
// Procurar Eventos de Organizador para Transferência
// ==========================================
export async function getOrganizerEventsForTransfer(eventoId: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, message: "Não autenticado." };

        const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
        if (!evento) return { success: false, message: "Evento original não encontrado." };

        const eventos = await prisma.evento.findMany({
            where: {
                organizadorId: session.userId,
                id: { not: eventoId },
                estado: "PUBLICADO"
            },
            include: {
                lotes: true
            },
            orderBy: { dataInicio: 'asc' }
        });

        return {
            success: true,
            data: eventos.map(ev => ({
                id: ev.id,
                titulo: ev.titulo,
                lotes: ev.lotes.map(l => ({
                    id: l.id,
                    nome: l.nome,
                    preco: l.preco,
                    quantidadeDisponivel: l.quantidadeDisponivel,
                    lotacaoTotal: l.lotacaoTotal
                }))
            }))
        };
    } catch (error: any) {
        console.error("Erro ao procurar eventos para transferência:", error);
        return { success: false, message: `Erro: ${error.message}` };
    }
}

// ==========================================
// Reembolsar Bilhetes (Simulado) e Cancelar Evento
// ==========================================
export async function reembolsarBilhetesEvento(eventoId: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, message: "Não autenticado." };

        const evento = await prisma.evento.findUnique({
            where: { id: eventoId },
            include: { lotes: true }
        });
        if (!evento) return { success: false, message: "Evento não encontrado." };
        if (evento.organizadorId !== session.userId) {
            return { success: false, message: "Sem permissão para cancelar este evento." };
        }

        // Encontrar todos os bilhetes do evento
        const lotIds = evento.lotes.map(l => l.id);
        const bilhetes = await prisma.bilhete.findMany({
            where: { loteId: { in: lotIds } },
            select: { id: true, pedidoId: true }
        });

        const uniquePedidoIds = Array.from(new Set(bilhetes.map(b => b.pedidoId)));
        const bilheteIds = bilhetes.map(b => b.id);

        await prisma.$transaction(async (tx) => {
            // Cancelar os pedidos relacionados
            if (uniquePedidoIds.length > 0) {
                await tx.pedido.updateMany({
                    where: { id: { in: uniquePedidoIds } },
                    data: { estado: 'CANCELADO' }
                });
            }

            // Apagar os registos de acesso relacionados com estes bilhetes para evitar violação de chaves estrangeiras
            if (bilheteIds.length > 0) {
                await tx.registoAcesso.deleteMany({
                    where: { bilheteId: { in: bilheteIds } }
                });
            }

            // Apagar os bilhetes para libertar as chaves e stock
            if (lotIds.length > 0) {
                await tx.bilhete.deleteMany({
                    where: { loteId: { in: lotIds } }
                });

                // Repor a capacidade dos lotes
                for (const lote of evento.lotes) {
                    await tx.loteBilhete.update({
                        where: { id: lote.id },
                        data: { quantidadeDisponivel: lote.lotacaoTotal }
                    });
                }
            }

            // Mudar o estado do evento para CANCELADO
            await tx.evento.update({
                where: { id: eventoId },
                data: { estado: 'CANCELADO' }
            });
        });

        return { success: true, message: "Bilhetes reembolsados (simulado) e evento cancelado com sucesso." };
    } catch (error: any) {
        console.error("Erro ao reembolsar bilhetes:", error);
        return { success: false, message: `Erro ao reembolsar: ${error.message}` };
    }
}

// ==========================================
// Transferir Bilhetes para Outro Evento e Cancelar Evento
// ==========================================
export async function transferirBilhetesEvento(eventoId: number, destinoLoteId: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, message: "Não autenticado." };

        // Procurar evento de origem e os seus lotes
        const sourceEvento = await prisma.evento.findUnique({
            where: { id: eventoId },
            include: { lotes: true }
        });
        if (!sourceEvento) return { success: false, message: "Evento de origem não encontrado." };
        if (sourceEvento.organizadorId !== session.userId) {
            return { success: false, message: "Sem permissão para transferir bilhetes deste evento." };
        }

        // Procurar lote de destino
        const destLote = await prisma.loteBilhete.findUnique({
            where: { id: destinoLoteId },
            include: { evento: true }
        });
        if (!destLote) return { success: false, message: "Lote de destino não encontrado." };
        if (destLote.evento.organizadorId !== session.userId) {
            return { success: false, message: "O lote de destino deve pertencer a um evento seu." };
        }

        // Encontrar todos os bilhetes a transferir
        const sourceLoteIds = sourceEvento.lotes.map(l => l.id);
        const bilhetesToTransfer = await prisma.bilhete.findMany({
            where: { loteId: { in: sourceLoteIds } }
        });

        const ticketsCount = bilhetesToTransfer.length;
        if (ticketsCount === 0) {
            return { success: false, message: "Não existem bilhetes vendidos para este evento." };
        }

        // Verificar capacidade do lote de destino
        if (destLote.quantidadeDisponivel < ticketsCount) {
            return {
                success: false,
                message: `O lote de destino '${destLote.nome}' tem apenas ${destLote.quantidadeDisponivel} vagas disponíveis (são necessários ${ticketsCount}).`
            };
        }

        await prisma.$transaction(async (tx) => {
            // Transferir todos os bilhetes de lote
            await tx.bilhete.updateMany({
                where: { loteId: { in: sourceLoteIds } },
                data: { loteId: destinoLoteId }
            });

            // Decrementar capacidade no lote de destino
            await tx.loteBilhete.update({
                where: { id: destinoLoteId },
                data: {
                    quantidadeDisponivel: destLote.quantidadeDisponivel - ticketsCount
                }
            });

            // Repor capacidade no lote de origem (vazio)
            for (const lote of sourceEvento.lotes) {
                await tx.loteBilhete.update({
                    where: { id: lote.id },
                    data: { quantidadeDisponivel: lote.lotacaoTotal }
                });
            }

            // Marcar evento de origem como CANCELADO
            await tx.evento.update({
                where: { id: eventoId },
                data: { estado: 'CANCELADO' }
            });
        });

        return { success: true, message: `Transferência de ${ticketsCount} bilhete(s) concluída e evento cancelado.` };
    } catch (error: any) {
        console.error("Erro ao transferir bilhetes:", error);
        return { success: false, message: `Erro ao transferir: ${error.message}` };
    }
}

export async function publicarEvento(eventoId: number) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado. Apenas organizadores podem publicar eventos.' };
        }

        const ev = await prisma.evento.findUnique({
            where: { id: eventoId }
        });

        if (!ev) {
            return { success: false, message: 'Evento não encontrado.' };
        }

        if (ev.organizadorId !== session.userId) {
            return { success: false, message: 'Não autorizado. Este evento pertence a outro organizador.' };
        }

        await prisma.evento.update({
            where: { id: eventoId },
            data: { estado: 'PUBLICADO' }
        });

        return { success: true, message: 'Evento publicado com sucesso!' };
    } catch (e: any) {
        return { success: false, message: `Erro ao publicar evento: ${e.message}` };
    }
}

