import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '../../../lib/session';

// Mapa seguro de MIME types para extensões (evita path traversal via nome de ficheiro)
const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

export async function POST(request: NextRequest) {
    try {
        // 1. Verificar autenticação — apenas organizadores e admins podem fazer upload
        const sessionCookie = request.cookies.get('session')?.value;
        if (!sessionCookie) {
            return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });
        }

        const session = await decrypt(sessionCookie);
        if (!session || (session.role !== 'ORGANIZADOR' && session.role !== 'ADMIN')) {
            return NextResponse.json({ success: false, message: 'Não autorizado. Apenas organizadores podem fazer upload.' }, { status: 403 });
        }

        // 2. Ler e validar o ficheiro
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'Nenhum ficheiro enviado.' }, { status: 400 });
        }

        if (!mimeToExt[file.type]) {
            return NextResponse.json({ success: false, message: 'Formato inválido. Use JPG, PNG ou WebP.' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, message: 'Ficheiro demasiado grande. Máximo 5MB.' }, { status: 400 });
        }

        // 3. Converter o ficheiro para Base64 Data URL (compatível com sistemas de ficheiros Read-Only de serverless)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        return NextResponse.json({ success: true, url: dataUrl });
    } catch (error: any) {
        console.error('Erro no upload:', error);
        return NextResponse.json({ success: false, message: 'Erro no upload.' }, { status: 500 });
    }
}
