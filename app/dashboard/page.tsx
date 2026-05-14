import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';

export default async function DashboardRouter() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    // Route based on role
    switch (session.role) {
        case 'ORGANIZADOR':
            redirect('/dashboard/organizador');
        case 'STAFF':
            redirect('/dashboard/admin');
        case 'PARTICIPANTE':
        default:
            redirect('/dashboard/utilizador');
    }
}
