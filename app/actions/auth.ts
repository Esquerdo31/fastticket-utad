"use server";

import * as bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession } from "../../lib/session";
import prisma from "../../lib/prisma";
import { z } from "zod";

// ==========================================
// Schemas de Validação (Zod)
// Adaptado do authController.ts do Rafa
// ==========================================

const loginSchema = z.object({
    email: z.string().email('Formato de email inválido.'),
    password: z.string().min(1, 'A palavra-passe é obrigatória.'),
});

const registarSchema = z.object({
    nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    email: z.string().email('Formato de email inválido.'),
    password: z.string().min(6, 'A palavra-passe deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'A confirmação da palavra-passe é obrigatória.'),
    role: z.enum(['organizador', 'participante'], {
        message: 'Tipo de perfil inválido.',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
});

// ==========================================
// Login
// ==========================================

export async function loginUser(prevState: any, formData: FormData) {
    const session = await getSession();
    const rawData = {
        email: formData.get("login-email") as string,
        password: formData.get("login-password") as string,
    };

    // 1. Validar com Zod
    const parseResult = loginSchema.safeParse(rawData);
    if (!parseResult.success) {
        const errors = parseResult.error.flatten().fieldErrors;
        const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
        return { success: false, message: firstError };
    }

    const { email, password } = parseResult.data;

    try {
        const user = await prisma.utilizador.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: false, message: "Utilizador não encontrado." };
        }

        if (!user.passwordHash || !user.passwordHash.startsWith('$2')) {
            return { success: false, message: "Esta conta não tem uma palavra-passe configurada. Utilize o link enviado por e-mail para aceder ou defina uma palavra-passe no perfil." };
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return { success: false, message: "Palavra-passe errada." };
        }

        // Criar sessão JWT com o Nome gravado
        await createSession(user.id, user.email, user.nome, user.role);
        return { success: true, message: "Login realizado com sucesso!", role: user.role };
    } catch (e: any) {
        return { success: false, message: `Erro ao iniciar sessão: ${e.message}` };
    }
}

// ==========================================
// Registo
// ==========================================

export async function registerUser(prevState: any, formData: FormData) {
    const session = await getSession();
    const rawData = {
        role: formData.get("profile_type") as string,
        nome: formData.get("reg-name") as string,
        email: formData.get("reg-email") as string,
        password: formData.get("reg-password") as string,
        confirmPassword: formData.get("reg-confirm-password") as string,
    };

    // 1. Validar com Zod
    const parseResult = registarSchema.safeParse(rawData);
    if (!parseResult.success) {
        const errors = parseResult.error.flatten().fieldErrors;
        const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
        return { success: false, message: firstError };
    }

    const { nome, email, password, role } = parseResult.data;

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
                nome: nome,
                email: email,
                passwordHash: hashedPassword,
                role: mappedRole,
            },
        });

        // Criar sessão (Auto-login após registo) com o Nome
        await createSession(newUser.id, newUser.email, newUser.nome, newUser.role);
        return { success: true, message: "Conta criada e sessão iniciada!", role: newUser.role };
    } catch (e: any) {
        return { success: false, message: `Erro ao registar conta: ${e.message}` };
    }
}

// ==========================================
// Logout & Sessão
// ==========================================

export async function logoutUser() {
    const session = await getSession();
    if (!session) {
        return { success: false, message: "Não autenticado." };
    }
    await deleteSession();
    return { success: true };
}

export async function getActiveSession() {
    return await getSession();
}
