"use server";

import prisma from "../../lib/prisma";
import * as bcrypt from "bcryptjs";
import { getSession, createSession } from "../../lib/session";

export async function getProfileData(userId: number) {
    try {
        const session = await getSession();
        if (!session || session.userId !== userId) {
            return { success: false, message: "Não autorizado." };
        }

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
        const session = await getSession();
        if (!session || session.userId !== userId) {
            return { success: false, message: "Não autorizado." };
        }

        await prisma.utilizador.update({
            where: { id: userId },
            data: {
                nome: data.nome,
                email: data.email,
            }
        });

        // Refrescar o cookie da sessão com os dados atualizados
        await createSession(userId, data.email, data.nome, session.role);

        return { success: true, message: "Perfil atualizado com sucesso!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function changePassword(userId: number, data: { currentPassword?: string; newPassword: string }) {
    try {
        const session = await getSession();
        if (!session || session.userId !== userId) {
            return { success: false, message: "Não autorizado." };
        }

        const user = await prisma.utilizador.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { success: false, message: "Utilizador não encontrado." };
        }

        // Se o utilizador já tiver uma palavra-passe registada, validá-la primeiro
        if (user.passwordHash) {
            if (!data.currentPassword) {
                return { success: false, message: "A palavra-passe atual é obrigatória." };
            }
            const passwordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
            if (!passwordValid) {
                return { success: false, message: "A palavra-passe atual está incorreta." };
            }
        }

        // Validar comprimento mínimo da nova palavra-passe
        if (data.newPassword.trim().length < 6) {
            return { success: false, message: "A nova palavra-passe deve ter pelo menos 6 caracteres." };
        }

        const hashed = await bcrypt.hash(data.newPassword.trim(), 10);

        await prisma.utilizador.update({
            where: { id: userId },
            data: {
                passwordHash: hashed
            }
        });

        return { success: true, message: "Palavra-passe alterada com sucesso!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
