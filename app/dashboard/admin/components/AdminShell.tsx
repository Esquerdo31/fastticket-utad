"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminEvents from './AdminEvents';
import ProfileContent from '../../utilizador/components/ProfileContent';

type ActiveTab = 'dashboard' | 'users' | 'events' | 'profile';

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
    user: {
        id: number;
        nome: string;
        email: string;
        role: string;
    };
}

export default function AdminShell({ userName, summary, users, eventos, user }: AdminShellProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
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

    const sideNavItems: { id: ActiveTab; icon: string; label: string }[] = [
        { id: 'dashboard', icon: 'dashboard', label: 'Painel' },
        { id: 'users', icon: 'group', label: 'Utilizadores' },
        { id: 'events', icon: 'event', label: 'Eventos' },
        { id: 'profile', icon: 'settings', label: 'Configurações' },
    ];

    const bottomNavItems: { id: ActiveTab; icon: string; label: string }[] = [
        { id: 'dashboard', icon: 'dashboard', label: 'Painel' },
        { id: 'users', icon: 'group', label: 'Users' },
        { id: 'events', icon: 'event', label: 'Eventos' },
        { id: 'profile', icon: 'settings', label: 'Config' },
    ];

    return (
        <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans">
            {/* TopAppBar */}
            <header className="fixed top-0 z-50 w-full bg-white shadow-sm flex justify-between items-center px-6 py-3 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight hover:opacity-80 transition-opacity">UTAD FastTicket</Link>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest hidden sm:inline-block">Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div onClick={() => handleTabChange('profile')} className="flex items-center gap-2 border-l border-slate-200 pl-4 cursor-pointer hover:opacity-80 transition-opacity">
                        <span className="text-sm font-semibold text-slate-900">{userName}</span>
                        <span className="material-symbols-outlined text-slate-900">shield_person</span>
                    </div>
                </div>
            </header>

            <div className="flex min-h-screen pt-16">
                {/* SideNavBar (Desktop) */}
                <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col pt-20 pb-6 hidden md:flex">
                    <div className="px-6 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                            <div>
                                <p className="text-lg font-black text-white leading-none">Sistema</p>
                                <p className="text-[10px] uppercase tracking-widest text-blue-300 mt-1">Administração</p>
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
                                    className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 text-left cursor-pointer border-l-4 ${
                                        isActive
                                            ? 'text-white font-bold border-blue-500 bg-slate-800'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
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
                <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-24 md:pb-10 bg-slate-50">
                    <div key={activeTab} className="animate-fadeIn">
                        {activeTab === 'dashboard' && <AdminDashboard userName={userName} summary={summary} />}
                        {activeTab === 'users' && <AdminUsers users={users} />}
                        {activeTab === 'events' && <AdminEvents eventos={eventos} />}
                        {activeTab === 'profile' && <ProfileContent user={user} onLogout={handleLogout} />}
                    </div>
                </main>
            </div>

            {/* BottomNavBar (Mobile only) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 shadow-lg flex justify-around items-center py-3 px-4 z-50">
                {bottomNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
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
