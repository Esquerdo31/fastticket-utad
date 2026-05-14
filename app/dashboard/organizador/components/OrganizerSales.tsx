"use client";

import React from 'react';

interface EventoStat {
    id: number;
    titulo: string;
    bilhetesVendidos: number;
    receita: number;
}

interface OrganizerSalesProps {
    eventos: EventoStat[];
    summary: {
        totalBilhetesVendidos: number;
        receitaTotal: number;
    };
}

export default function OrganizerSales({ eventos, summary }: OrganizerSalesProps) {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Relatório de Vendas</h1>
                <p className="text-slate-500">Acompanhe as receitas e vendas de bilhetes de todos os seus eventos.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-violet-900 to-violet-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-violet-900/20">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-2">Receita Total Acumulada</p>
                            <p className="text-5xl font-extrabold drop-shadow-md">{summary.receitaTotal.toFixed(2)}€</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <span className="material-symbols-outlined text-3xl">account_balance</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total de Bilhetes Vendidos</p>
                        <p className="text-5xl font-extrabold text-slate-900">{summary.totalBilhetesVendidos}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                    </div>
                </div>
            </div>

            {/* Sales List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">Vendas por Evento</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {eventos.length > 0 ? eventos.map(evento => (
                        <div key={evento.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{evento.titulo}</h4>
                                    <p className="text-sm text-slate-500">{evento.bilhetesVendidos} bilhetes vendidos</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Receita</p>
                                <p className="text-xl font-extrabold text-emerald-600">+{evento.receita.toFixed(2)}€</p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-10 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">receipt_long</span>
                            <p className="text-slate-500 font-medium">Nenhum dado de venda disponível.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
