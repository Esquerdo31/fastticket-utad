"use client";

import React from 'react';

interface AdminDashboardProps {
    userName: string;
    summary: {
        totalUsers: number;
        totalEventos: number;
        totalPedidos: number;
        receitaTotal: number;
    };
}

export default function AdminDashboard({ userName, summary }: AdminDashboardProps) {
    return (
        <>
            <section className="mb-10">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 lg:p-12 text-white shadow-xl shadow-slate-900/10">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                    <div className="relative z-10">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-300 mb-2">Painel de Administração</p>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">Bem-vindo(a), {userName.split(" ")[0]}.</h1>
                        <p className="text-lg opacity-90 max-w-xl leading-relaxed">
                            Visão global do sistema. Monitorize a atividade, utilizadores e receitas de toda a plataforma.
                        </p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] opacity-10 rotate-12 select-none">admin_panel_settings</span>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                        <span className="material-symbols-outlined text-3xl">group</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Utilizadores</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <span className="material-symbols-outlined text-3xl">event</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Eventos</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.totalEventos}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                        <span className="material-symbols-outlined text-3xl">receipt_long</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pedidos</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.totalPedidos}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <span className="material-symbols-outlined text-3xl">account_balance</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita Global</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.receitaTotal.toFixed(2)}€</p>
                    </div>
                </div>
            </div>
            
            {/* Quick Actions Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Ações Rápidas</h2>
                <div className="flex gap-4 flex-wrap">
                    <button className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">person_add</span> Novo Staff
                    </button>
                    <button className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">summarize</span> Gerar Relatório
                    </button>
                    <button className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">settings</span> Configurações de Sistema
                    </button>
                </div>
            </div>
        </>
    );
}
