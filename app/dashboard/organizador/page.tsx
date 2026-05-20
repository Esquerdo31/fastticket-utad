import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import { getOrganizerDashboardData } from '@/app/actions/organizador';
import { getParceriasPromotor } from '@/app/actions/promotores';
import OrganizerShell from './components/OrganizerShell';

export default async function OrganizerDashboardPage() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    if (session.role !== 'ORGANIZADOR' && session.role !== 'STAFF') {
        redirect('/dashboard');
    }

    const [dashboardResult, parceriasResult] = await Promise.all([
        getOrganizerDashboardData(session.userId),
        getParceriasPromotor()
    ]);

    const summary = dashboardResult.summary || { totalEventos: 0, totalBilhetesVendidos: 0, receitaTotal: 0, totalCapacity: 0 };
    const eventos = dashboardResult.eventos || [];
    const nextEvents = dashboardResult.nextEvents || [];
    const recentPurchases = (dashboardResult as any).recentPurchases || [];
    const salesByDate = (dashboardResult as any).salesByDate || [];
    const promoterLeaderboard = (dashboardResult as any).promoterLeaderboard || [];
    const userName = session.nome || "Organizador";
    const pedidoPromotores = dashboardResult.pedidoPromotores || 'NADA';
    const parcerias = parceriasResult.success ? (parceriasResult.data || []) : [];

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
            recentPurchases={recentPurchases}
            salesByDate={salesByDate}
            promoterLeaderboard={promoterLeaderboard}
            user={user}
            pedidoPromotores={pedidoPromotores}
            parcerias={parcerias}
        />
    );
}
