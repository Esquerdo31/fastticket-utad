"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminApprovals from './AdminApprovals';
import AdminLogs from './AdminLogs';

type ActiveTab = 'dashboard' | 'users' | 'approvals' | 'logs';

interface AdminShellProps {
    userName: string;
    summary: {
        totalUsers: number;
        totalEventos: number;
        totalPedidos: number;
        receitaTotal: number;
    };
    users: any[];
    eventos: any[];
    promoterRequests: any[];
    user: {
        id: number;
        nome: string;
        email: string;
        role: string;
    };
}

export default function AdminShell({ userName, summary, users, eventos, promoterRequests, user }: AdminShellProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleRefresh = () => {
        router.refresh();
    };

    const sideNavItems: { id: ActiveTab; icon: string; label: string }[] = [
        { id: 'dashboard', icon: 'grid_view', label: 'Geral' },
        { id: 'users', icon: 'manage_accounts', label: 'Utilizadores' },
        { id: 'approvals', icon: 'verified', label: 'Aprovações' },
        { id: 'logs', icon: 'terminal', label: 'Logs do Sistema' },
    ];

    // Filter data based on search query if necessary
    const filteredUsers = users.filter(u =>
        u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredEvents = eventos.filter(e =>
        e.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.localizacao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.organizadorNome.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans flex flex-col md:flex-row">

            {/* SideNavBar (Desktop & Mobile Shell) */}
            <aside className="w-full md:w-64 bg-[#022c22] text-white flex flex-col justify-between shrink-0 md:fixed md:h-screen z-50">
                <div className="flex flex-col">
                    {/* Sidebar Header */}
                    <div className="px-6 py-6 border-b border-emerald-900/60">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-400 text-3xl">shield</span>
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-wider text-white">FastTicket Admin</h1>
                                <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Administração</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="mt-6 space-y-1 px-3">
                        {sideNavItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-left cursor-pointer font-semibold text-xs tracking-wide ${isActive
                                            ? 'text-white bg-emerald-800/80 shadow-sm border border-emerald-700/50'
                                            : 'text-emerald-300/80 hover:text-white hover:bg-emerald-900/40'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-emerald-900/60 space-y-1">
                    <button
                        type="button"
                        onClick={() => alert('Suporte FastTicket UTAD: admin-support@utad.pt')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-900/40 transition-all text-xs font-semibold text-left"
                    >
                        <span className="material-symbols-outlined text-lg">help</span>
                        <span>Support</span>
                    </button>
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:text-white hover:bg-red-900/40 transition-all text-xs font-semibold text-left"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span>{isPending ? 'Saindo...' : 'Logout'}</span>
                    </button>
                </div>
            </aside>

            {/* Main Layout Area */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">

                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex justify-between items-center sticky top-0 z-40">
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-sm font-black text-slate-800 hidden sm:inline-block tracking-tight">UTAD FastTicket</span>

                        {/* Search Input */}
                        <div className="relative max-w-md w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Procurar transações, eventos ou utilizadores..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Right utilities & Super Admin profile card */}
                    <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                        <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>

                        {/* Super Admin Badge */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-black text-slate-900 leading-none">{userName}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Administrador Central</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 relative overflow-hidden">
                                <span className="material-symbols-outlined text-xl">shield_person</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Canvas */}
                <main className="flex-1 p-6 sm:p-8 bg-[#f8fafc] max-w-6xl mx-auto w-full pb-20">
                    <div key={activeTab} className="animate-fadeIn">
                        {activeTab === 'dashboard' && (
                            <AdminDashboard
                                userName={userName}
                                summary={summary}
                                onTabChange={handleTabChange}
                            />
                        )}
                        {activeTab === 'users' && (
                            <AdminUsers
                                users={filteredUsers}
                                onRefresh={handleRefresh}
                            />
                        )}
                        {activeTab === 'approvals' && (
                            <AdminApprovals
                                eventos={filteredEvents}
                                promoterRequests={promoterRequests}
                                onRefresh={handleRefresh}
                            />
                        )}
                        {activeTab === 'logs' && (
                            <AdminLogs
                                users={users}
                                eventos={eventos}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
