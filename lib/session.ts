import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

type SessionPayload = {
    userId: number;
    email: string;
    role: string;
    expiresAt: Date;
};

const secretKey = process.env.JWT_SECRET || "minha-chave-secreta-em-desenvolvimento";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
    if (!session) return null;
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });
        return payload as SessionPayload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: number, email: string, role: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const session = await encrypt({ userId, email, role, expiresAt });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
}
