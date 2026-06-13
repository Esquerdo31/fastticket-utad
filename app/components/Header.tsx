"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getActiveSession, logoutUser } from '@/app/actions/auth';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [userSession, setUserSession] = useState<any>(null);
    const [isPending, startTransition] = useTransition();
    const [showDropdown, setShowDropdown] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        getActiveSession().then((session) => {
            setUserSession(session);
            if (session?.userId) {
                const saved = localStorage.getItem(`profileAvatar_${session.userId}`);
                if (saved) setAvatarUrl(saved);
            }
        });
    }, []);

    // Listen for avatar changes from other components
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key && e.key.startsWith('profileAvatar_') && e.newValue) {
                setAvatarUrl(e.newValue);
            }
        };
        const handleAvatarChanged = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.avatarUrl) {
                setAvatarUrl(detail.avatarUrl);
            }
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('avatarChanged', handleAvatarChanged);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('avatarChanged', handleAvatarChanged);
        };
    }, []);

    const handleLogout = () => {
        startTransition(async () => {
            await logoutUser();
            setUserSession(null);
            router.push('/login');
            router.refresh();
        });
    };

    const isActive = (path: string) => pathname === path;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-md flex justify-between items-center px-6 py-3 border-b border-slate-200/80 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] antialiased transition-all duration-300">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-lg font-bold tracking-tight hover:opacity-85 active:scale-95 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent text-2xl font-bold">local_activity</span>
                    <span className="bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent font-black">UTAD FastTicket</span>
                </Link>
                <nav className="hidden md:flex gap-2 items-center">
                    <Link 
                        href="/eventos" 
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                            isActive('/eventos')
                                ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100/50'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                        }`}
                    >
                        Explorar Eventos
                    </Link>
                    <Link 
                        href="/sobre" 
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                            isActive('/sobre')
                                ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100/50'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                        }`}
                    >
                        Sobre
                    </Link>
                </nav>
            </div>
            
            <div className="flex items-center gap-4">
                {userSession ? (
                    <div className="flex items-center gap-3 md:gap-4">
                        <Link 
                            href="/wishlist" 
                            className={`p-2.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                                isActive('/wishlist')
                                    ? 'bg-red-50 text-red-600 shadow-sm border border-red-100/50'
                                    : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                            }`} 
                            title="Favoritos"
                        >
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                        </Link>
                        
                        <div className="relative">
                            <button 
                                type="button"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className={`flex items-center gap-1.5 pl-4 border-l border-slate-200/80 cursor-pointer hover:opacity-85 active:scale-95 transition-all focus:outline-none ${
                                    pathname?.startsWith('/dashboard')
                                        ? 'text-emerald-800 font-bold'
                                        : 'text-slate-700 hover:text-emerald-700'
                                }`} 
                                title="Menu de Utilizador"
                            >
                                <span className="text-xs md:text-sm font-bold max-w-[100px] md:max-w-[150px] truncate">{userSession.nome || userSession.email.split("@")[0]}</span>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover border-2 border-emerald-200" />
                                ) : (
                                    <span className="material-symbols-outlined text-emerald-700 text-[22px]">account_circle</span>
                                )}
                                <span className="material-symbols-outlined text-[16px] text-slate-400">keyboard_arrow_down</span>
                            </button>

                            {showDropdown && (
                                <>
                                    <button type="button" tabIndex={-1} aria-hidden="true" className="fixed inset-0 z-30 cursor-default" onClick={() => setShowDropdown(false)} />
                                    <div className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-2 z-40 text-left animate-fadeIn">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="bg-emerald-50 text-[#006837] text-[9px] font-black px-2 py-0.5 rounded border border-emerald-100/50 uppercase tracking-wider">
                                                    {userSession.role === 'ORGANIZADOR' ? 'Organizador' : userSession.role === 'ADMIN' ? 'Administrador' : 'Participante'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 truncate">{userSession.nome}</p>
                                            <p className="text-xs text-slate-400 truncate">{userSession.email}</p>
                                        </div>
                                        <div className="py-1.5">
                                            <Link 
                                                href="/dashboard" 
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition-all duration-150 font-medium"
                                            >
                                                <span className="material-symbols-outlined text-[20px] text-slate-400">dashboard</span>
                                                O meu Painel
                                            </Link>
                                            <Link 
                                                href="/dashboard?tab=profile" 
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition-all duration-150 font-medium"
                                            >
                                                <span className="material-symbols-outlined text-[20px] text-slate-400">settings</span>
                                                Definições
                                            </Link>
                                        </div>
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <div className="py-1">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-150 font-bold text-left cursor-pointer border-none bg-transparent"
                                            >
                                                <span className="material-symbols-outlined text-[20px] text-red-500">logout</span>
                                                Terminar Sessão
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <Link 
                        href="/login" 
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-700/10 hover:shadow-lg active:scale-95 transition-all duration-200"
                    >
                        Iniciar Sessão
                    </Link>
                )}
            </div>
        </header>
    );
}
