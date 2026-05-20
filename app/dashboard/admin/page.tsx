import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import { getAdminDashboardData, getAdminUsers, getAdminEvents, getPendingPromoterRequests } from '@/app/actions/admin';
import AdminShell from './components/AdminShell';

export default async function AdminDashboardPage() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    if (session.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const [dashboardResult, usersResult, eventsResult, promoterRequestsResult] = await Promise.all([
        getAdminDashboardData(),
        getAdminUsers(),
        getAdminEvents(),
        getPendingPromoterRequests()
    ]);

    const summary = dashboardResult.summary || { totalUsers: 0, totalEventos: 0, totalPedidos: 0, receitaTotal: 0 };
    const users = usersResult.users || [];
    const eventos = eventsResult.eventos || [];
    const promoterRequests = promoterRequestsResult.requests || [];
    const userName = session.nome || "Admin";

    const user = {
        id: session.userId,
        nome: userName,
        email: session.email || '',
        role: session.role,
    };

    return (
        <AdminShell
            userName={userName}
            summary={summary}
            users={users}
            eventos={eventos}
            promoterRequests={promoterRequests}
            user={user}
        />
    );
}
