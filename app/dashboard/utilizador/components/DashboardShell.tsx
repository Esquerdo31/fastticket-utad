"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';
import DashboardContent from './DashboardContent';
import ProfileContent from './ProfileContent';
import TicketsContent from './TicketsContent';
import BillingContent from './BillingContent';
import PromotorContent from './PromotorContent';

type ActiveTab = 'dashboard' | 'tickets' | 'billing' | 'profile' | 'promotor';

interface DashboardShellProps {
    userName: string;
    nextEvents: any[];
    suggestions: any[];
    user: {
        id: number;
        nome: string;
        email: string;
        role: string;
    };
    tickets: any[];
    orders: any[];
    parcerias: any[];
    billingSummary: {
        totalGasto: number;
        totalPedidos: number;
        totalBilhetes: number;
    };
    initialTab?: ActiveTab;
}

export default function DashboardShell({ userName, nextEvents, suggestions, user, tickets, orders, parcerias, billingSummary, initialTab = 'dashboard' }: DashboardShellProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    React.useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const handleTabChange = (tab: ActiveTab) => {
        setActiveTab(tab);
    };

    const handleLogout = () => {
        startTransition(async () => {
            await logoutUser();
            router.push('/login');
        });
    };

    const sideNavItems: { id: ActiveTab; icon: string; label: string }[] = [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { id: 'tickets', icon: 'confirmation_number', label: 'Meus Bilhetes' },
        ...(parcerias.length > 0 ? [{ id: 'promotor' as ActiveTab, icon: 'campaign', label: 'Afiliados / Promotor' }] : []),
        { id: 'billing', icon: 'payments', label: 'Faturação' },
        { id: 'profile', icon: 'person', label: 'Definições' },
    ];

    const bottomNavItems: { id: ActiveTab | 'explore'; icon: string; label: string; href?: string }[] = [
        { id: 'dashboard', icon: 'dashboard', label: 'Painel' },
        { id: 'tickets', icon: 'confirmation_number', label: 'Bilhetes' },
        ...(parcerias.length > 0 ? [{ id: 'promotor' as ActiveTab, icon: 'campaign', label: 'Promotor' }] : []),
        { id: 'explore', icon: 'search', label: 'Agenda', href: '/eventos' },
        { id: 'profile', icon: 'person', label: 'Perfil' },
    ];

    return (
        <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans">
            {/* TopAppBar */}
            <header className="fixed top-0 z-50 w-full bg-white shadow-sm flex justify-between items-center px-6 py-3 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-[#006837] tracking-tight hover:opacity-80 transition-opacity">UTAD FastTicket</Link>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-8 items-center">
                        <Link className="text-[#006837] font-bold tracking-tight hover:bg-emerald-50 rounded-lg px-3 py-2 -mx-3 transition-all cursor-pointer" href="/eventos">Explorar Eventos</Link>
                        <a className="text-slate-600 hover:bg-slate-50 transition-colors px-2 py-1 rounded font-medium" href="#">Ajuda</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => handleTabChange('profile')}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <span className="text-sm font-semibold text-[#006837]">{userName}</span>
                            <span className="material-symbols-outlined text-[#006837]">account_circle</span>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            disabled={isPending}
                            className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1 pl-4 border-l border-slate-200 cursor-pointer disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            <span className="hidden sm:inline">{isPending ? 'Saindo...' : 'Sair'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex min-h-screen pt-16">
                {/* SideNavBar (Desktop) */}
                <aside className="fixed left-0 top-0 h-full w-64 bg-white flex flex-col pt-20 pb-6 hidden md:flex border-r border-slate-200">
                    <div className="px-6 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-[#006837] flex items-center justify-center text-white font-black text-lg">U</div>
                            <div>
                                <p className="text-lg font-black text-[#006837] leading-none">Portal UTAD</p>
                                <p className="text-[10px] uppercase tracking-widest text-[#006837]/60 mt-1">Participante</p>
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
                                    className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 text-left cursor-pointer ${
                                        isActive
                                            ? 'text-[#006837] font-bold border-r-4 border-[#006837] bg-emerald-50/50'
                                            : 'text-slate-500 hover:text-[#006837] hover:bg-emerald-50'
                                    }`}
                                >
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                    <span className="text-sm tracking-wide">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="px-4">
                        <Link href="/eventos" className="w-full bg-[#006837] text-white py-3 rounded-lg font-semibold shadow-lg shadow-[#006837]/20 hover:bg-emerald-800 hover:shadow-xl hover:shadow-[#006837]/25 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                            Comprar Bilhetes
                        </Link>
                    </div>
                </aside>

                {/* Main Content Canvas */}
                <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-24 md:pb-10">
                    <div key={activeTab} className="animate-fadeIn">
                        {activeTab === 'dashboard' && (
                            <DashboardContent 
                                userName={userName} 
                                nextEvents={nextEvents} 
                                suggestions={suggestions} 
                                parcerias={parcerias}
                                onTabChange={handleTabChange}
                            />
                        )}
                        {activeTab === 'tickets' && (
                            <TicketsContent tickets={tickets} />
                        )}
                        {activeTab === 'promotor' && (
                            <PromotorContent parcerias={parcerias} onRefresh={() => router.refresh()} />
                        )}
                        {activeTab === 'billing' && (
                            <BillingContent orders={orders} summary={billingSummary} />
                        )}
                        {activeTab === 'profile' && (
                            <ProfileContent user={user} onLogout={handleLogout} />
                        )}
                    </div>
                </main>
            </div>

            {/* BottomNavBar (Mobile only) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-lg flex justify-around items-center py-3 px-4 z-50">
                {bottomNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    if (item.href) {
                        return (
                            <Link key={item.id} href={item.href} className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-slate-500 hover:text-[#006837] hover:bg-emerald-50 transition-all cursor-pointer">
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="text-[10px]">{item.label}</span>
                            </Link>
                        );
                    }
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id as ActiveTab)}
                            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all cursor-pointer active:scale-95 ${isActive ? 'text-[#006837] font-bold bg-emerald-50' : 'text-slate-500 hover:text-[#006837] hover:bg-emerald-50'}`}
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
