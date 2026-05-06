"use server";

import prisma from "../../lib/prisma";

export async function getProfileData(userId: number) {
    try {
        const user = await prisma.utilizador.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
            }
        });

        if (!user) {
            return { success: false, message: "Utilizador não encontrado." };
        }

        return {
            success: true,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateProfileData(userId: number, data: { nome: string; email: string }) {
    try {
        await prisma.utilizador.update({
            where: { id: userId },
            data: {
                nome: data.nome,
                email: data.email,
            }
        });

        return { success: true, message: "Perfil atualizado com sucesso!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
