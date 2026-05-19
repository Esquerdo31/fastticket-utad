"use server";

import prisma from "../../lib/prisma";
import { getSession } from "../../lib/session";

export async function getPromotoresPorEvento(eventoId: number) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        const promotores = await prisma.promotor.findMany({
            where: { eventoId },
            include: {
                utilizador: {
                    select: { nome: true, email: true }
                },
                pedidosGerados: {
                    where: { estado: 'PAGO' },
                    include: { bilhetes: true }
                }
            }
        });

        // Map and calculate leaderboard stats
        const data = promotores.map(p => {
            const bilhetesVendidos = p.pedidosGerados.reduce((acc, pedido) => acc + pedido.bilhetes.length, 0);
            const receitaGerada = p.pedidosGerados.reduce((acc, pedido) => acc + pedido.valorTotal, 0);
            
            // Calculate commission
            let comissaoTotal = 0;
            if (p.comissaoPercent) {
                comissaoTotal = receitaGerada * (p.comissaoPercent / 100);
            } else if (p.comissaoValor) {
                comissaoTotal = bilhetesVendidos * p.comissaoValor;
            }

            return {
                id: p.id,
                nome: p.utilizador.nome,
                email: p.utilizador.email,
                linkSlug: p.linkSlug,
                comissaoValor: p.comissaoValor,
                comissaoPercent: p.comissaoPercent,
                bilhetesVendidos,
                receitaGerada,
                comissaoTotal
            };
        });

        // Sort by bilhetesVendidos descending
        data.sort((a, b) => b.bilhetesVendidos - a.bilhetesVendidos);

        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function adicionarPromotor(eventoId: number, email: string, slug: string, comissaoValor: number | null, comissaoPercent: number | null) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        // Find user by email
        const user = await prisma.utilizador.findUnique({ where: { email } });
        if (!user) {
            return { success: false, message: 'Nenhum utilizador encontrado com este e-mail. Peça-lhe para criar conta primeiro.' };
        }

        // Create promoter
        const promotor = await prisma.promotor.create({
            data: {
                eventoId,
                utilizadorId: user.id,
                linkSlug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                comissaoValor,
                comissaoPercent
            }
        });

        return { success: true, message: 'Parceiro adicionado com sucesso!' };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, message: 'Já existe um parceiro com este slug ou este utilizador já é parceiro neste evento.' };
        }
        return { success: false, message: error.message };
    }
}
