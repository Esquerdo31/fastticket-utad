"use client";

import React from 'react';
import Link from 'next/link';

interface EventoStat {
    id: number;
    titulo: string;
    dataInicio: string;
    localizacao: string;
    lotacaoMaxima: number;
    bilhetesVendidos: number;
    receita: number;
}

interface OrganizerDashboardProps {
    userName: string;
    summary: {
        totalEventos: number;
        totalBilhetesVendidos: number;
        receitaTotal: number;
    };
    nextEvents: EventoStat[];
}

export default function OrganizerDashboard({ userName, summary, nextEvents }: OrganizerDashboardProps) {
    return (
        <>
            {/* Welcome Section */}
            <section className="mb-10">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-900 via-violet-800 to-violet-600 p-8 lg:p-12 text-white shadow-xl shadow-violet-900/10">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                    <div className="relative z-10">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-300 mb-2">Painel de Organizador</p>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">Bem-vindo(a), {userName.split(" ")[0]}.</h1>
                        <p className="text-lg opacity-90 max-w-xl leading-relaxed">
                            Acompanhe o desempenho dos seus eventos e gira as vendas de bilhetes em tempo real.
                        </p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] opacity-10 rotate-12 select-none">campaign</span>
                </div>
            </section>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700">
                        <span className="material-symbols-outlined text-3xl">event</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eventos Ativos</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.totalEventos}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <span className="material-symbols-outlined text-3xl">local_activity</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bilhetes Vendidos</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.totalBilhetesVendidos}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <span className="material-symbols-outlined text-3xl">payments</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita Total</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.receitaTotal.toFixed(2)}€</p>
                    </div>
                </div>
            </div>

            {/* Next Events */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Próximos Eventos</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {nextEvents.length > 0 ? nextEvents.map((evento) => (
                        <Link href={`/evento/${evento.id}`} key={evento.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-violet-200 transition-all group cursor-pointer">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-violet-100 text-violet-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        Brevemente
                                    </span>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-violet-500 transition-colors text-[20px]">open_in_new</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-violet-700 transition-colors">{evento.titulo}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                    {evento.dataInicio}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Lotação</span>
                                        <span className="font-bold text-slate-900">{evento.bilhetesVendidos} / {evento.lotacaoMaxima}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-violet-600 rounded-full" 
                                            style={{ width: `${Math.min(100, (evento.bilhetesVendidos / evento.lotacaoMaxima) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                            <p className="text-slate-500 font-medium">Não tem eventos agendados.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
