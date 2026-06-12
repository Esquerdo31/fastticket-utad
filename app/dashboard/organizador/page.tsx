import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import { getOrganizerDashboardData, getOrganizerStats } from '@/app/actions/organizador';
import { getParceriasPromotor } from '@/app/actions/promotores';
import OrganizerShell from './components/OrganizerShell';

export const metadata = {
    title: "Painel de Organizador - UTAD FastTicket",
    description: "Criar e gerir eventos, lotes de bilhetes e promotores na plataforma UTAD FastTicket."
};

export default async function OrganizerDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }> | { tab?: string };
}) {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    if (session.role !== 'ORGANIZADOR') {
        redirect('/dashboard');
    }

    const resolvedSearchParams = await searchParams;
    const initialTab = (resolvedSearchParams?.tab === 'profile' || resolvedSearchParams?.tab === 'events' || resolvedSearchParams?.tab === 'sales' || resolvedSearchParams?.tab === 'dashboard' || resolvedSearchParams?.tab === 'promoters' || resolvedSearchParams?.tab === 'staff' || resolvedSearchParams?.tab === 'promotor')
        ? resolvedSearchParams.tab
        : 'dashboard';

    const [dashboardResult, parceriasResult, organizerStats] = await Promise.all([
        getOrganizerDashboardData(session.userId),
        getParceriasPromotor(),
        getOrganizerStats(session.userId)
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
            organizerStats={organizerStats}
            recentPurchases={recentPurchases}
            salesByDate={salesByDate}
            promoterLeaderboard={promoterLeaderboard}
            user={user}
            pedidoPromotores={pedidoPromotores}
            parcerias={parcerias}
            initialTab={initialTab as any}
        />
    );
}
