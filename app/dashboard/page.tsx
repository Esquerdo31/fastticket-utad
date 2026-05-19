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
        case 'ORGANIZADOR':
            redirect('/dashboard/organizador');
        case 'STAFF': {
            const associationsCount = await prisma.eventoStaff.count({
                where: { staffId: session.userId }
            });
            if (associationsCount > 0) {
                redirect('/dashboard/staff');
            }
            redirect('/dashboard/admin');
        }
        case 'PARTICIPANTE':
        default:
            redirect('/dashboard/utilizador');
    }
}
