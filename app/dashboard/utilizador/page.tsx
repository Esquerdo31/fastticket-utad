import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import { getDashboardData } from '@/app/actions/dashboard';
import { getProfileData } from '@/app/actions/profile';
import { getTicketsData, getBillingData } from '@/app/actions/tickets';
import { getParceriasPromotor } from '@/app/actions/promotores';
import DashboardShell from './components/DashboardShell';

export const metadata = {
    title: "Painel do Utilizador - UTAD FastTicket",
    description: "Gerir os meus bilhetes, faturas e perfil na plataforma UTAD FastTicket."
};

export default async function UserDashboard({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }> | { tab?: string };
}) {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    const resolvedSearchParams = await searchParams;
    const initialTab = (resolvedSearchParams?.tab === 'profile' || resolvedSearchParams?.tab === 'tickets' || resolvedSearchParams?.tab === 'billing' || resolvedSearchParams?.tab === 'dashboard' || resolvedSearchParams?.tab === 'promotor')
        ? resolvedSearchParams.tab
        : 'dashboard';

    const [dashboard, profile, ticketsResult, billingResult, parceriasResult] = await Promise.all([
        getDashboardData(session.userId),
        getProfileData(session.userId),
        getTicketsData(session.userId),
        getBillingData(session.userId),
        getParceriasPromotor(),
    ]);

    const nextEvents = dashboard.nextEvents || [];
    const suggestions = dashboard.suggestedEvents || [];
    const userName = dashboard.userName || "Participante";

    const user = profile.user || {
        id: session.userId,
        nome: userName,
        email: session.email || '',
        role: session.role || 'PARTICIPANTE',
    };

    const tickets = ticketsResult.tickets || [];
    const orders = billingResult.orders || [];
    const billingSummary = billingResult.summary || { totalGasto: 0, totalPedidos: 0, totalBilhetes: 0 };
    const parcerias = parceriasResult.success ? (parceriasResult.data || []) : [];

    return (
        <DashboardShell
            userName={userName}
            nextEvents={nextEvents}
            suggestions={suggestions}
            user={user}
            tickets={tickets}
            orders={orders}
            parcerias={parcerias}
            billingSummary={billingSummary}
            initialTab={initialTab as any}
        />
    );
}