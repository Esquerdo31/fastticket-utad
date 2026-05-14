"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';
import OrganizerDashboard from './OrganizerDashboard';
import OrganizerEvents from './OrganizerEvents';
import OrganizerSales from './OrganizerSales';
import ProfileContent from '../../utilizador/components/ProfileContent';
import CreateEventWizard from './CreateEventWizard';

type ActiveTab = 'dashboard' | 'events' | 'sales' | 'profile' | 'create-event' | 'edit-event';

interface OrganizerShellProps {
    userName: string;
    summary: {
        totalEventos: number;
        totalBilhetesVendidos: number;
        receitaTotal: number;
    };
    eventos: any[];
    nextEvents: any[];
    user: {
        id: number;
        nome: string;
        email: string;
        role: string;
    };
}

export default function OrganizerShell({ userName, summary, eventos, nextEvents, user }: OrganizerShellProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [editEventId, setEditEventId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleTabChange = (tab: ActiveTab) => {
        setActiveTab(tab);
    };

    const handleLogout = () => {
        startTransition(async () => {
            await logoutUser();
            router.push('/login');
        });
    };

    const handleEditEvent = (eventoId: number) => {
        setEditEventId(eventoId);
        setActiveTab('edit-event');
    };

    const sideNavItems: { id: ActiveTab; icon: string; label: string }[] = [
        { id: 'dashboard', icon: 'dashboard', label: 'Painel' },
        { id: 'events', icon: 'campaign', label: 'Meus Eventos' },
        { id: 'sales', icon: 'analytics', label: 'Vendas' },
        { id: 'profile', icon: 'person', label: 'Definições' },
    ];

    const bottomNavItems: { id: ActiveTab; icon: string; label: string }[] = [
        { id: 'dashboard', icon: 'dashboard', label: 'Painel' },
        { id: 'events', icon: 'campaign', label: 'Eventos' },
        { id: 'sales', icon: 'analytics', label: 'Vendas' },
        { id: 'profile', icon: 'person', label: 'Perfil' },
    ];

    return (
        <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans">
            {/* TopAppBar */}
            <header className="fixed top-0 z-50 w-full bg-white shadow-sm flex justify-between items-center px-6 py-3 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-violet-700 tracking-tight hover:opacity-80 transition-opacity">UTAD FastTicket</Link>
                    <span className="bg-violet-100 text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest hidden sm:inline-block">Organizador</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div onClick={() => handleTabChange('profile')} className="flex items-center gap-2 border-l border-slate-200 pl-4 cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="text-sm font-semibold text-violet-700">{userName}</span>
                        <span className="material-symbols-outlined text-violet-700">account_circle</span>
                    </div>
                </div>
            </header>

            <div className="flex min-h-screen pt-16">
                {/* SideNavBar (Desktop) */}
                <aside className="fixed left-0 top-0 h-full w-64 bg-white flex flex-col pt-20 pb-6 hidden md:flex border-r border-slate-200">
                    <div className="px-6 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-violet-700 flex items-center justify-center text-white font-black text-lg">O</div>
                            <div>
                                <p className="text-lg font-black text-violet-700 leading-none">Painel</p>
                                <p className="text-[10px] uppercase tracking-widest text-violet-700/60 mt-1">Organizador</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1">
                        {sideNavItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 text-left cursor-pointer ${isActive
                                            ? 'text-violet-700 font-bold border-r-4 border-violet-700 bg-violet-50/50'
                                            : 'text-slate-500 hover:text-violet-700 hover:bg-violet-50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                    <span className="text-sm tracking-wide">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Canvas */}
                <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-24 md:pb-10">
                    <div key={activeTab} className="animate-fadeIn">
                        {activeTab === 'dashboard' && <OrganizerDashboard userName={userName} summary={summary} nextEvents={nextEvents} />}
                        {activeTab === 'events' && <OrganizerEvents eventos={eventos} onCreateEvent={() => handleTabChange('create-event')} onEditEvent={handleEditEvent} />}
                        {activeTab === 'create-event' && <CreateEventWizard userName={userName} userId={user.id} onEventCreated={() => { handleTabChange('events'); router.refresh(); }} />}
                        {activeTab === 'edit-event' && editEventId && <CreateEventWizard userName={userName} userId={user.id} editEventId={editEventId} onEventCreated={() => { setEditEventId(null); handleTabChange('events'); router.refresh(); }} />}
                        {activeTab === 'sales' && <OrganizerSales eventos={eventos} summary={summary} />}
                        {activeTab === 'profile' && <ProfileContent user={user} onLogout={handleLogout} />}
                    </div>
                </main>
            </div>

            {/* BottomNavBar (Mobile only) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-lg flex justify-around items-center py-3 px-4 z-50">
                {bottomNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`flex flex-col items-center gap-1 ${isActive ? 'text-violet-700 font-bold' : 'text-slate-500'}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-[10px]">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
