import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'Nenhum ficheiro enviado.' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, message: 'Formato inválido. Use JPG, PNG ou WebP.' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ success: false, message: 'Ficheiro demasiado grande. Máximo 5MB.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `evento-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (error: any) {
        console.error('Erro no upload:', error);
        return NextResponse.json({ success: false, message: 'Erro no upload.' }, { status: 500 });
    }
}
