import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import { getOrganizerDashboardData } from '@/app/actions/organizador';
import OrganizerShell from './components/OrganizerShell';

export default async function OrganizerDashboardPage() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    if (session.role !== 'ORGANIZADOR' && session.role !== 'STAFF') {
        redirect('/dashboard');
    }

    const dashboardResult = await getOrganizerDashboardData(session.userId);

    const summary = dashboardResult.summary || { totalEventos: 0, totalBilhetesVendidos: 0, receitaTotal: 0 };
    const eventos = dashboardResult.eventos || [];
    const nextEvents = dashboardResult.nextEvents || [];
    const userName = session.nome || "Organizador";

    const user = {
        id: session.userId,
        nome: userName,
        email: session.email || '',
        role: session.role,
    };

    return (
        <OrganizerShell
            userName={userName}
            summary={summary}
            eventos={eventos}
            nextEvents={nextEvents}
            user={user}
        />
    );
}
