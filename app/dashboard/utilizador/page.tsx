import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import { getDashboardData } from '@/app/actions/dashboard';
import { getProfileData } from '@/app/actions/profile';
import { getTicketsData, getBillingData } from '@/app/actions/tickets';
import DashboardShell from './components/DashboardShell';

export default async function UserDashboard() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    const [dashboard, profile, ticketsResult, billingResult] = await Promise.all([
        getDashboardData(session.userId),
        getProfileData(session.userId),
        getTicketsData(session.userId),
        getBillingData(session.userId),
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

    return (
        <DashboardShell
            userName={userName}
            nextEvents={nextEvents}
            suggestions={suggestions}
            user={user}
            tickets={tickets}
            orders={orders}
            billingSummary={billingSummary}
        />
    );
}