"use server";

import * as bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession } from "../../lib/session";
import prisma from "../../lib/prisma";

export async function loginUser(prevState: any, formData: FormData) {
    const email = formData.get("login-email") as string;
    const password = formData.get("login-password") as string;

    if (!email || !password) {
        return { success: false, message: "Campos obrigatórios em falta." };
    }

    try {
        const user = await prisma.utilizador.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: false, message: "Utilizador não encontrado." };
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return { success: false, message: "Palavra-passe errada." };
        }

        // 5. Criar sessão JWT com o Nome gravado
        await createSession(user.id, user.email, user.nome, user.role);
        return { success: true, message: "Login realizado com sucesso!" };
    } catch (e: any) {
        return { success: false, message: `Erro ao iniciar sessão: ${e.message}` };
    }
}

export async function registerUser(prevState: any, formData: FormData) {
    const role = formData.get("profile_type") as string;
    const name = formData.get("reg-name") as string;
    const email = formData.get("reg-email") as string;
    const password = formData.get("reg-password") as string;
    const confirmPassword = formData.get("reg-confirm-password") as string;

    if (!name || !email || !password || !confirmPassword || !role) {
        return { success: false, message: "Por favor, preencha todos os campos." };
    }
    if (password !== confirmPassword) {
        return { success: false, message: "As palavras-passe não coincidem." };
    }

    try {
        // Verificar se já existe
        const existing = await prisma.utilizador.findUnique({ where: { email } });
        if (existing) {
            return { success: false, message: "Este e-mail já se encontra registado." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const mappedRole = role === "organizador" ? "ORGANIZADOR" : "PARTICIPANTE";

        // Inserir Utilizador
        const newUser = await prisma.utilizador.create({
            data: {
                nome: name,
                email: email,
                passwordHash: hashedPassword,
                role: mappedRole,
            },
        });

        // 6. Criar sessão (Auto-login após registo) com o Nome
        await createSession(newUser.id, newUser.email, newUser.nome, newUser.role);
        return { success: true, message: "Conta criada e sessão iniciada!" };
    } catch (e: any) {
        return { success: false, message: `Erro ao registar conta: ${e.message}` };
    }
}

export async function logoutUser() {
    await deleteSession();
    return { success: true };
}

export async function getActiveSession() {
    return await getSession();
}
