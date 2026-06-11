import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import prisma from '@/lib/prisma';

export default async function DashboardRouter({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }> | { tab?: string };
}) {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    const resolvedSearchParams = await searchParams;
    const tab = resolvedSearchParams?.tab || '';
    const query = tab ? `?tab=${tab}` : '';

    // Route based on role
    switch (session.role) {
        case 'ADMIN':
            redirect(`/dashboard/admin${query}`);
        case 'STAFF':
            redirect(`/dashboard/staff${query}`);
        case 'ORGANIZADOR':
            redirect(`/dashboard/organizador${query}`);
        case 'PARTICIPANTE':
        default:
            redirect(`/dashboard/utilizador${query}`);
    }
}
