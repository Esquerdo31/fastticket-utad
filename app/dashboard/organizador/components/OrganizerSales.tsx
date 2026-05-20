"use client";

import React, { useState } from 'react';

interface LoteStat {
    id: number;
    nome: string;
    tipo: string;
    preco: number;
    lotacaoTotal: number;
    quantidadeDisponivel: number;
    bilhetesVendidos: number;
    receita: number;
}

interface EventoStat {
    id: number;
    titulo: string;
    dataInicio: string;
    localizacao: string;
    lotacaoMaxima: number;
    bilhetesVendidos: number;
    receita: number;
    lotes?: LoteStat[];
}

interface RecentPurchase {
    id: number;
    compradorNome: string;
    compradorEmail: string;
    data: string;
    valor: number;
    ticketsDesc: string;
    eventoTitulo: string;
    promotorSlug: string | null;
    promotorNome: string | null;
}

interface OrganizerSalesProps {
    eventos: EventoStat[];
    summary: {
        totalBilhetesVendidos: number;
        receitaTotal: number;
    };
    recentPurchases?: RecentPurchase[];
}

export default function OrganizerSales({ eventos, summary, recentPurchases = [] }: OrganizerSalesProps) {
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

    const toggleEventDetails = (id: number) => {
        setExpandedEvent(expandedEvent === id ? null : id);
    };

    const precoMedio = summary.totalBilhetesVendidos > 0 
        ? (summary.receitaTotal / summary.totalBilhetesVendidos) 
        : 0;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Relatório de Vendas</h1>
                <p className="text-slate-500 text-sm">Acompanhe detalhadamente o desempenho financeiro, vendas de lotes e histórico de compras.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-violet-900 via-indigo-950 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-violet-950/20">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300 mb-2">Receita Total</p>
                            <p className="text-4xl font-black drop-shadow-sm">{summary.receitaTotal.toFixed(2)}€</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <span className="material-symbols-outlined text-[24px]">account_balance</span>
                        </div>
                    </div>
                </div>

                {/* Tickets Sold Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bilhetes Vendidos</p>
                        <p className="text-4xl font-black text-slate-900">{summary.totalBilhetesVendidos}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    </div>
                </div>

                {/* Average Ticket Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Preço Médio do Bilhete</p>
                        <p className="text-4xl font-black text-slate-900">{precoMedio.toFixed(2)}€</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[24px]">price_check</span>
                    </div>
                </div>
            </div>

            {/* Sales List with Lot Breakdowns */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-700">campaign</span>
                        Vendas por Evento e Lote
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{eventos.length} eventos</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {eventos.length > 0 ? eventos.map(evento => {
                        const isExpanded = expandedEvent === evento.id;
                        return (
                            <div key={evento.id} className="transition-all duration-200">
                                {/* Event Summary Header */}
                                <div 
                                    onClick={() => toggleEventDetails(evento.id)} 
                                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-700 shrink-0">
                                            <span className="material-symbols-outlined">analytics</span>
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-slate-900 text-base">{evento.titulo}</h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{evento.dataInicio}</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">confirmation_number</span>{evento.bilhetesVendidos} bilhetes</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 self-end md:self-center">
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Receita</p>
                                            <p className="text-lg font-black text-emerald-600">+{evento.receita.toFixed(2)}€</p>
                                        </div>
                                        <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-violet-700' : ''}`}>
                                            keyboard_arrow_down
                                        </span>
                                    </div>
                                </div>

                                {/* Event Lots Breakdown (Collapsible) */}
                                {isExpanded && (
                                    <div className="bg-slate-50/50 border-t border-slate-100 p-6 space-y-4 animate-fadeIn">
                                        <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Desdobramento por Lote de Bilhetes</h5>
                                        {evento.lotes && evento.lotes.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {evento.lotes.map(lote => {
                                                    const percent = lote.lotacaoTotal > 0 
                                                        ? (lote.bilhetesVendidos / lote.lotacaoTotal) * 100 
                                                        : 0;
                                                    
                                                    return (
                                                        <div key={lote.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-violet-200 transition-colors">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h6 className="font-bold text-slate-800 text-sm">{lote.nome}</h6>
                                                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                                                                            lote.tipo === 'GERAL' ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-700'
                                                                        }`}>
                                                                            {lote.tipo === 'GERAL' ? 'Passe Geral' : 'Diário'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 mt-0.5">{lote.preco > 0 ? `${lote.preco.toFixed(2)}€` : 'Grátis'}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Lote Receita</p>
                                                                    <p className="text-sm font-extrabold text-slate-800">{lote.receita.toFixed(2)}€</p>
                                                                </div>
                                                            </div>

                                                            {/* Capacity progress */}
                                                            <div className="mt-3">
                                                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                                    <span>Vendas: <strong className="text-slate-800">{lote.bilhetesVendidos}</strong> / {lote.lotacaoTotal}</span>
                                                                    <span>{percent.toFixed(0)}%</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-violet-600 rounded-full transition-all duration-300"
                                                                        style={{ width: `${percent}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                                                    <span>Disponível: {lote.quantidadeDisponivel}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 italic">Sem lotes configurados neste evento.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="p-10 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">receipt_long</span>
                            <p className="text-slate-500 font-medium">Nenhum dado de venda disponível.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Purchases Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                        Histórico de Transações Recentes
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Últimas 10 compras</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">Comprador</th>
                                <th className="p-4">Evento</th>
                                <th className="p-4">Bilhetes Adquiridos</th>
                                <th className="p-4 text-center">Referência Promotor</th>
                                <th className="p-4 text-right">Valor Pago</th>
                                <th className="p-4 text-right pr-6">Data & Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {recentPurchases.length > 0 ? recentPurchases.map(purchase => (
                                <tr key={purchase.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="p-4 pl-6">
                                        <p className="font-bold text-slate-800">{purchase.compradorNome}</p>
                                        <p className="text-xs text-slate-400 font-mono">{purchase.compradorEmail}</p>
                                    </td>
                                    <td className="p-4 max-w-[200px]">
                                        <p className="font-semibold text-slate-700 truncate" title={purchase.eventoTitulo}>
                                            {purchase.eventoTitulo}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-slate-600 text-xs bg-slate-100 inline-block px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                                            {purchase.ticketsDesc}
                                        </p>
                                    </td>
                                    <td className="p-4 text-center">
                                        {purchase.promotorSlug ? (
                                            <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 text-[10px] font-bold px-2 py-0.5 rounded border border-violet-200 shadow-sm" title={`Promotor: ${purchase.promotorNome}`}>
                                                <span className="material-symbols-outlined text-[12px]">link</span>
                                                {purchase.promotorSlug}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right font-extrabold text-slate-900">
                                        {purchase.valor.toFixed(2)}€
                                    </td>
                                    <td className="p-4 text-right text-xs text-slate-500 font-medium pr-6">
                                        {purchase.data}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-500 font-medium italic">
                                        Nenhuma compra recente registada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
