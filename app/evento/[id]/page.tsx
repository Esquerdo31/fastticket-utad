"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getActiveSession, logoutUser } from '../../actions/auth';
import { getEventoById } from '../../actions/event';
import Link from 'next/link';

export default function EventDetailsDynamic() {
    const params = useParams();
    const router = useRouter();

    // --- Estados ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
    const [userSession, setUserSession] = useState<any>(null);
    const [evento, setEvento] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveSession().then(setUserSession);
        if (params.id) {
            getEventoById(Number(params.id))
                .then(res => {
                    if (res.success && res.data) {
                        setEvento(res.data);
                        if (res.data.lotes && res.data.lotes.length > 0) {
                            setSelectedTicket(res.data.lotes[0].id); // Seleciona o primeiro lote por defeito
                        }
                    } else {
                        router.push('/eventos'); // Cód. não existe, volta pra trás
                    }
                })
                .catch(err => {
                    console.error("Erro ao carregar evento:", err);
                    router.push('/eventos');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [params.id, router]);

    const handleLogout = async () => {
        await logoutUser();
        setUserSession(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-[#006837] font-semibold animate-pulse">A carregar evento...</p>
            </div>
        );
    }

    if (!evento) return null;

    return (
        <div className="bg-slate-50 font-sans text-slate-800 min-h-screen">
            {/* TopAppBar */}
            <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 antialiased">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#006837] hover:opacity-80 transition-opacity">
                            UTAD FastTicket
                        </Link>
                        <nav className="hidden md:flex gap-6">
                            <a href="/eventos" className="text-[#006837] border-b-2 border-[#006837] pb-1 font-semibold">Eventos</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Procurar eventos..."
                                className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg border-none focus:ring-2 focus:ring-[#006837]/20 text-sm w-64 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {userSession ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="text-sm font-bold text-white bg-[#006837] px-4 py-2 rounded-lg whitespace-nowrap shadow-md hover:bg-emerald-800 transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    {userSession.nome || userSession.email.split("@")[0]}
                                </Link>
                                <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                    Sair
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => router.push('/login')} className="px-5 py-2 bg-[#006837] text-white font-medium rounded-lg hover:bg-emerald-800 active:scale-95 duration-200 transition-all shadow-md">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="min-h-screen">
                {/* Event Banner Section */}
                <section className={`relative h-[614px] min-h-[450px] w-full overflow-hidden ${!(evento.bannerUrl && evento.mostrarBanner) ? 'bg-gradient-to-br from-[#0b2818] via-[#004d29] to-[#006837]' : ''} flex items-center`}>
                    {evento.bannerUrl && evento.mostrarBanner ? (
                        <>
                            <img src={evento.bannerUrl} alt={evento.title} className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                        </>
                    ) : (
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                    )}
                    <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pt-32 pb-16 w-full">
                        <div className="max-w-3xl">
                            <div className="flex items-end gap-6 mb-6">
                                {evento.thumbnailUrl && evento.mostrarLogo && (
                                    <img src={evento.thumbnailUrl} alt="Logo" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white/20 shadow-2xl shrink-0 backdrop-blur-sm" />
                                )}
                                <div>
                                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-4 rounded-full shadow-lg">
                                        {evento.category}
                                    </span>
                                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md">
                                        {evento.title}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-8 text-emerald-50 max-w-2xl bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a7f3d0]">Data e Hora</span>
                                    <div className="flex items-center gap-2 font-medium">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                        <span>{evento.date}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a7f3d0]">Localização</span>
                                    <div className="flex items-center gap-2 font-medium">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        <span>{evento.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Main Column (Left) */}
                        <article className="lg:col-span-8 space-y-12">
                            {/* Description */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#006837]"></div>
                                <h2 className="text-2xl font-bold mb-6 text-slate-800">Sobre o Evento</h2>
                                <div className="prose prose-emerald max-w-none text-slate-600 leading-relaxed space-y-4">
                                    <p className="whitespace-pre-wrap">{evento.description}</p>
                                </div>
                            </section>

                            {/* Additional Info */}
                            <section className="grid md:grid-cols-2 gap-8 pt-6">
                                <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Organização</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#0b2818] rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                                            <span className="material-symbols-outlined">corporate_fare</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{evento.organizador}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Entidade Oficial Registada</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-orange-800/60 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">info</span>
                                        Regras de Acesso
                                    </h4>
                                    <p className="text-sm text-orange-900/80 leading-relaxed font-medium">
                                        Bilhetes sujeitos à verificação de identidade à porta. O QR Code gerado deve ser mantido confidencial.
                                    </p>
                                </div>
                            </section>
                        </article>

                        {/* Sidebar Column (Right - Sticky) */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-28 space-y-6">

                                {/* Ticket Card */}
                                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                                    <div className="p-6 bg-[#006837] text-white">
                                        <h3 className="text-xl font-bold">Garantir Bilhete</h3>
                                        <p className="text-emerald-100/90 text-sm mt-1">Selecione o seu lote abaixo</p>
                                    </div>

                                    <div className="p-6 space-y-4 bg-white">
                                        {evento.lotes && evento.lotes.length > 0 ? evento.lotes.map((ticket: any) => {
                                            const isSelected = selectedTicket === ticket.id;
                                            const isSoldOut = ticket.esgotado;
                                            // Matemática da ocupação
                                            const ocupados = ticket.lotacaoTotal - ticket.quantidadeDisponivel;
                                            const percentagem = Math.min(100, Math.max(0, Math.round((ocupados / ticket.lotacaoTotal) * 100)));
                                            const almostGone = !isSoldOut && ticket.quantidadeDisponivel <= 20;

                                            return (
                                                <div key={ticket.id} className="block relative">
                                                    <label
                                                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${isSoldOut ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' : isSelected
                                                            ? 'border-[#006837] bg-emerald-50/50 shadow-md shadow-emerald-100'
                                                            : 'border-slate-200 hover:border-[#006837]/40 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-start gap-3">
                                                                <input
                                                                    type="radio"
                                                                    name="ticket"
                                                                    className="mt-1 outline-none accent-[#006837] h-4 w-4 shrink-0"
                                                                    checked={isSelected}
                                                                    disabled={isSoldOut}
                                                                    onChange={() => setSelectedTicket(ticket.id)}
                                                                />
                                                                <div>
                                                                    <p className="font-bold text-slate-800 leading-tight">{ticket.name}</p>
                                                                    {ticket.description && (
                                                                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{ticket.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`text-lg font-extrabold shrink-0 ml-2 ${isSoldOut ? 'text-slate-400' : 'text-[#006837]'}`}>
                                                                {ticket.price}
                                                            </span>
                                                        </div>

                                                        {/* Lotação Bar */}
                                                        {ticket.lotacaoTotal > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-slate-200/70">
                                                                <div className="flex justify-between items-end mb-2">
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ocupação do Lote</span>
                                                                    {isSoldOut ? (
                                                                        <span className="text-[11px] font-bold text-red-600 px-2 py-0.5 bg-red-50 rounded text-right">ESGOTADO</span>
                                                                    ) : almostGone ? (
                                                                        <span className="text-[11px] font-bold text-amber-600 text-right">Apenas {ticket.quantidadeDisponivel} restantes!</span>
                                                                    ) : (
                                                                        <span className="text-[11px] font-bold text-[#006837] text-right">{percentagem}% reservado</span>
                                                                    )}
                                                                </div>
                                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-1000 ${isSoldOut ? 'bg-red-500' : almostGone ? 'bg-amber-500' : 'bg-[#006837]'}`}
                                                                        style={{ width: `${percentagem}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            );
                                        }) : (
                                            <p className="text-center text-slate-500 py-4 text-sm font-medium">Sem bilhetes disponíveis de momento.</p>
                                        )}

                                        <button
                                            disabled={!selectedTicket || userSession?.role === "ORGANIZADOR" || userSession?.role === "STAFF" || userSession?.role === "ADMIN"}
                                            onClick={() => {
                                                const urlParams = new URLSearchParams(window.location.search);
                                                const ref = urlParams.get('ref');
                                                router.push(`/checkout/${evento.id}/${selectedTicket}${ref ? `?ref=${ref}` : ''}`);
                                            }}
                                            className={`w-full py-4 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6
                                                ${(selectedTicket && userSession?.role !== "ORGANIZADOR" && userSession?.role !== "STAFF" && userSession?.role !== "ADMIN") ? 'bg-[#006837] shadow-lg shadow-[#006837]/20 hover:bg-emerald-800' : 'bg-slate-300 cursor-not-allowed'}
                                            `}
                                        >
                                            Prosseguir para Checkout
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </button>

                                        {(userSession?.role === "ORGANIZADOR" || userSession?.role === "STAFF" || userSession?.role === "ADMIN") && (
                                            <p className="text-red-600 text-xs font-semibold text-center mt-2">
                                                Contas de organizador, staff ou administradores não podem comprar bilhetes.
                                            </p>
                                        )}

                                        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-4 font-semibold pb-2">
                                            Acesso Exclusivo FASTTICKET
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
