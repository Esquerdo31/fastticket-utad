"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getAvailabilityStatus(eventoId: number) {
    const lotes = await prisma.loteBilhete.findMany({
        where: { eventoId },
        select: {
            quantidadeDisponivel: true,
            lotacaoTotal: true,
        },
    });

    const bilhetesDisponiveis = lotes.reduce((total, lote) => total + lote.quantidadeDisponivel, 0);
    const lotacaoTotal = lotes.reduce((total, lote) => total + lote.lotacaoTotal, 0);

    return {
        bilhetesDisponiveis,
        lotacaoTotal,
        esgotado: bilhetesDisponiveis === 0,
        ultimosLugares: bilhetesDisponiveis > 0 && bilhetesDisponiveis < 5,
    };
}

export async function toggleWishlist(eventoId: number, userId?: number) {
    try {
        const session = await getSession();
        const utilizadorId = userId ?? session?.userId;

        if (!utilizadorId) {
            return { success: false, message: "Precisa de iniciar sessao para guardar favoritos.", isWishlisted: false };
        }

        const existing = await prisma.wishlist.findUnique({
            where: {
                utilizadorId_eventoId: {
                    utilizadorId,
                    eventoId,
                },
            },
        });

        if (existing) {
            await prisma.wishlist.delete({ where: { id: existing.id } });
            return { success: true, isWishlisted: false };
        }

        await prisma.wishlist.create({
            data: {
                utilizadorId,
                eventoId,
            },
        });

        return { success: true, isWishlisted: true };
    } catch (error: any) {
        console.error("[toggleWishlist] erro ao atualizar favoritos", error);
        return {
            success: false,
            message: error?.message || "Erro ao atualizar favoritos.",
            isWishlisted: false,
        };
    }
}

export async function joinWaitlist(eventoId: number, userId?: number) {
    const session = await getSession();
    const utilizadorId = userId ?? session?.userId;

    if (!utilizadorId) {
        return { success: false, message: "Precisa de iniciar sessao para entrar na lista de espera." };
    }

    await prisma.waitlist.upsert({
        where: {
            utilizadorId_eventoId: {
                utilizadorId,
                eventoId,
            },
        },
        update: {},
        create: {
            utilizadorId,
            eventoId,
        },
    });

    return { success: true, message: "Entrou na lista de espera. Avisaremos quando houver vagas." };
}

export async function getUserEngagementStatus(eventoId: number) {
    const session = await getSession();

    if (!session) {
        return {
            isWishlisted: false,
            isWaitlisted: false,
        };
    }

    try {
        const [wishlist, waitlist] = await Promise.all([
            prisma.wishlist.findUnique({
                where: {
                    utilizadorId_eventoId: {
                        utilizadorId: session.userId,
                        eventoId,
                    },
                },
            }),
            prisma.waitlist.findUnique({
                where: {
                    utilizadorId_eventoId: {
                        utilizadorId: session.userId,
                        eventoId,
                    },
                },
            }),
        ]);

        return {
            isWishlisted: Boolean(wishlist),
            isWaitlisted: Boolean(waitlist),
        };
    } catch (error) {
        console.error("[getUserEngagementStatus] erro ao ler wishlist/waitlist", error);
        return {
            isWishlisted: false,
            isWaitlisted: false,
        };
    }
}

export async function getWishlistEventos() {
    const session = await getSession();

    if (!session) {
        return {
            success: false,
            message: "Precisa de iniciar sessao para ver os favoritos.",
            data: [],
        };
    }

    try {
        const wishlistItems = await prisma.wishlist.findMany({
            where: {
                utilizadorId: session.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                evento: {
                    include: {
                        lotes: true,
                        organizador: {
                            select: {
                                nome: true,
                            },
                        },
                    },
                },
            },
        });

        const data = wishlistItems.map((item) => {
            const evento = item.evento;
            const dataObj = new Date(evento.dataInicio);
            const dateStr = dataObj.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
            const timeStr = dataObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
            const precos = evento.lotes.map((lote) => lote.preco);
            const minPrice = precos.length > 0 ? Math.min(...precos) : 0;
            const bilhetesDisponiveis = evento.lotes.reduce((total, lote) => total + lote.quantidadeDisponivel, 0);

            return {
                id: evento.id,
                title: evento.titulo,
                description: evento.descricao,
                date: `${dateStr} - ${timeStr}`,
                location: evento.localizacao,
                price: minPrice === 0 ? "Gratuito" : `${minPrice.toFixed(2)} EUR`,
                category: evento.categoria,
                organizador: evento.organizador.nome,
                bannerUrl: evento.bannerUrl || null,
                thumbnailUrl: evento.thumbnailUrl || null,
                mostrarBanner: evento.mostrarBanner,
                bilhetesDisponiveis,
                esgotado: bilhetesDisponiveis === 0,
            };
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("[getWishlistEventos] erro ao carregar favoritos", error);
        return {
            success: false,
            message: error?.message || "Erro ao carregar favoritos.",
            data: [],
        };
    }
}
