import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import prisma from '@/lib/prisma';

export default async function DashboardRouter() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    // Route based on role
    switch (session.role) {
        case 'ADMIN':
            redirect('/dashboard/admin');
        case 'STAFF':
            redirect('/dashboard/staff');
        case 'ORGANIZADOR':
            redirect('/dashboard/organizador');
        case 'PARTICIPANTE':
        default:
            redirect('/dashboard/utilizador');
    }
}
