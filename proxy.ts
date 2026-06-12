import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/session';

/**
 * Middleware de proteção de rotas.
 * Redireciona utilizadores não autenticados das áreas protegidas (dashboards)
 * para a página inicial com o modal de login aberto.
 */
export async function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    const payload = sessionCookie ? await decrypt(sessionCookie) : null;

    const { pathname } = request.nextUrl;

    // Proteger todas as rotas de dashboard
    if (pathname.startsWith('/dashboard') && !payload) {
        const loginUrl = new URL('/?auth=login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Proteger rotas de admin para não-admins
    if (pathname.startsWith('/dashboard/admin') && payload?.role !== 'ADMIN') {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
