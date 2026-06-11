"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { toggleWishlist } from '../actions/engagement';

interface WishlistContentProps {
    initialResult: {
        success: boolean;
        message?: string;
        data: any[];
    };
    session: any;
}

export default function WishlistContent({ initialResult, session }: WishlistContentProps) {
    const [eventos, setEventos] = useState<any[]>(initialResult.data || []);
    const [isPending, startTransition] = useTransition();

    const handleRemoveFavorite = (e: React.MouseEvent, eventoId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            alert("Precisa de iniciar sessão para alterar os favoritos.");
            return;
        }

        startTransition(async () => {
            // Optimistic update
            const prevEventos = [...eventos];
            setEventos(prev => prev.filter(ev => ev.id !== eventoId));

            const res = await toggleWishlist(eventoId);
            if (!res.success) {
                alert(res.message || "Não foi possível remover dos favoritos.");
                // Revert
                setEventos(prevEventos);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased pt-20 font-sans">
            <style>{`
                .remove-fav-btn .broken-icon {
                    display: none;
                }
                .remove-fav-btn:hover .fav-icon {
                    display: none;
                }
                .remove-fav-btn:hover .broken-icon {
                    display: block;
                    animation: scaleHeart 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes scaleHeart {
                    from { transform: scale(0.6); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8 border-b border-slate-200 pb-6">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-[#006837] mb-2">Favoritos</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">A minha wishlist</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Eventos que guardou para voltar a consultar mais tarde.
                    </p>
                </div>

                {!initialResult.success ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center max-w-md mx-auto shadow-sm space-y-4">
                        <span className="material-symbols-outlined text-red-500 text-5xl">lock</span>
                        <p className="text-base font-bold text-slate-800">{initialResult.message}</p>
                        <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-[#006837] px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition-colors shadow-md shadow-emerald-800/10">
                            Iniciar sessão
                        </Link>
                    </div>
                ) : eventos.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center max-w-md mx-auto shadow-sm space-y-4">
                        <span className="material-symbols-outlined text-[#006837] text-6xl">favorite_border</span>
                        <p className="text-lg font-bold text-slate-800">Ainda não tem eventos guardados</p>
                        <p className="text-sm text-slate-500">Quando clicar no coração de um evento, ele irá aparecer aqui.</p>
                        <Link href="/eventos" className="inline-flex items-center justify-center rounded-xl bg-[#006837] px-6 py-3 text-sm font-bold text-white hover:bg-emerald-800 transition-colors shadow-md shadow-emerald-800/10">
                            Ver Eventos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {eventos.map((evento: any) => (
                            <Link
                                key={evento.id}
                                href={`/evento/${evento.id}`}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                            >
                                <div className={`relative flex h-44 items-center justify-center overflow-hidden p-6 text-center ${evento.bannerUrl && evento.mostrarBanner ? "" : "bg-gradient-to-br from-[#0b2818] to-[#006837]"}`}>
                                    {evento.bannerUrl && evento.mostrarBanner && (
                                        <>
                                            <img src={evento.bannerUrl} alt={evento.title} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        </>
                                    )}
                                    <span className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md">
                                        {evento.category}
                                    </span>
                                    {evento.esgotado && (
                                        <span className="absolute right-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow">
                                            Esgotado
                                        </span>
                                    )}
                                    <h2 className="relative z-10 text-xl font-black text-white drop-shadow-md px-4 leading-tight">{evento.title}</h2>
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#006837]">
                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                        {evento.date}
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold leading-snug text-slate-800 line-clamp-1 group-hover:text-[#006837] transition-colors">{evento.title}</h3>
                                    <p className="mb-6 line-clamp-2 text-sm text-slate-500 leading-relaxed">{evento.description}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div>
                                            <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Desde</p>
                                            <p className="text-base font-extrabold text-[#006837]">{evento.price}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => handleRemoveFavorite(e, evento.id)}
                                                disabled={isPending}
                                                className="remove-fav-btn flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all cursor-pointer active:scale-90"
                                                title="Remover dos favoritos"
                                            >
                                                <span className="material-symbols-outlined text-[18px] fav-icon block">favorite</span>
                                                <span className="material-symbols-outlined text-[18px] broken-icon">heart_broken</span>
                                            </button>
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-[#006837] group-hover:text-white" aria-hidden="true">
                                                <span className="material-symbols-outlined text-slate-600 transition-colors group-hover:text-white">arrow_forward</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
