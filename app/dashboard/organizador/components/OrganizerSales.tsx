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

interface PromoterLeader {
    id: number;
    slug: string;
    name: string;
    eventoTitulo: string;
    salesCount: number;
    revenue: number;
    commissionEarned: number;
}

interface OrganizerSalesProps {
    eventos: EventoStat[];
    summary: {
        totalBilhetesVendidos: number;
        receitaTotal: number;
        totalCapacity?: number;
    };
    recentPurchases?: RecentPurchase[];
    salesByDate?: { date: string; count: number; revenue: number }[];
    promoterLeaderboard?: PromoterLeader[];
}

export default function OrganizerSales({ 
    eventos, 
    summary, 
    recentPurchases = [], 
    salesByDate = [], 
    promoterLeaderboard = [] 
}: OrganizerSalesProps) {
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
    const [filterText, setFilterText] = useState('');

    const toggleEventDetails = (id: number) => {
        setExpandedEvent(expandedEvent === id ? null : id);
    };

    const precoMedio = summary.totalBilhetesVendidos > 0 
        ? (summary.receitaTotal / summary.totalBilhetesVendidos) 
        : 0;

    const totalCapacity = summary.totalCapacity || 0;
    const ocupacaoGlobal = totalCapacity > 0
        ? Math.round((summary.totalBilhetesVendidos / totalCapacity) * 100)
        : 0;

    // Filter recent purchases dynamically
    const filteredPurchases = recentPurchases.filter(p => 
        p.compradorNome.toLowerCase().includes(filterText.toLowerCase()) ||
        p.compradorEmail.toLowerCase().includes(filterText.toLowerCase()) ||
        p.eventoTitulo.toLowerCase().includes(filterText.toLowerCase()) ||
        (p.promotorSlug || '').toLowerCase().includes(filterText.toLowerCase())
    );

    // CSV Export Handler
    const exportToCSV = () => {
        const headers = ["ID Pedido", "Comprador", "Email", "Evento", "Bilhetes Adquiridos", "Promotor Referencia", "Valor Pago (EUR)", "Data e Hora"];
        const rows = filteredPurchases.map(p => [
            p.id,
            p.compradorNome,
            p.compradorEmail,
            p.eventoTitulo,
            p.ticketsDesc,
            p.promotorSlug || "Nenhum",
            p.valor.toFixed(2),
            p.data
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_vendas_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // SVG Chart Calculations
    const chartWidth = 720;
    const chartHeight = 220;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const revenues = salesByDate.map(s => s.revenue);
    const maxRevenue = Math.max(...revenues, 10) * 1.1; // Add 10% headroom

    const points = salesByDate.map((s, idx) => {
        const x = paddingLeft + (idx / Math.max(salesByDate.length - 1, 1)) * plotWidth;
        const y = paddingTop + plotHeight - (s.revenue / maxRevenue) * plotHeight;
        return { x, y, date: s.date, count: s.count, revenue: s.revenue };
    });

    const pathD = points.length > 0 
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';
    
    const fillD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`
        : '';

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Relatório de Vendas</h1>
                    <p className="text-slate-500 text-sm">Acompanhe detalhadamente o desempenho financeiro, vendas de lotes, promotores e transações.</p>
                </div>
                <button 
                    onClick={exportToCSV}
                    disabled={filteredPurchases.length === 0}
                    className="shrink-0 bg-violet-700 hover:bg-violet-800 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-violet-700/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Exportar CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-violet-900 via-indigo-950 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-violet-950/20">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300 mb-2">Receita Total</p>
                            <p className="text-3xl font-black drop-shadow-sm">{summary.receitaTotal.toFixed(2)}€</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <span className="material-symbols-outlined text-[22px]">account_balance</span>
                        </div>
                    </div>
                </div>

                {/* Tickets Sold Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bilhetes Vendidos</p>
                        <p className="text-3xl font-black text-slate-900">{summary.totalBilhetesVendidos}</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
                    </div>
                </div>

                {/* Average Ticket Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Preço Médio</p>
                        <p className="text-3xl font-black text-slate-900">{precoMedio.toFixed(2)}€</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[22px]">price_check</span>
                    </div>
                </div>

                {/* Global Occupancy Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Ocupação Global</p>
                        <p className="text-3xl font-black text-slate-900">{ocupacaoGlobal}%</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <span className="material-symbols-outlined text-[22px]">bar_chart</span>
                    </div>
                </div>
            </div>

            {/* Sales Chart Card */}
            {salesByDate.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div>
                        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-violet-700">insights</span>
                            Tendência de Vendas (Últimos 15 Dias)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Evolução diária da receita obtida nos seus eventos. Passe o cursor sobre os pontos para ver detalhes.</p>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[720px] relative">
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Y-axis guidelines */}
                                {[0, 0.5, 1].map((ratio, index) => {
                                    const yVal = paddingTop + plotHeight * ratio;
                                    const revLabel = (maxRevenue * (1 - ratio)).toFixed(0);
                                    return (
                                        <g key={index} className="opacity-40">
                                            <line x1={paddingLeft} y1={yVal} x2={chartWidth - paddingRight} y2={yVal} stroke="#e2e8f0" strokeDasharray="4 4" />
                                            <text x={paddingLeft - 10} y={yVal + 4} textAnchor="end" className="text-[10px] font-semibold fill-slate-400">{revLabel}€</text>
                                        </g>
                                    );
                                })}

                                {/* Gradient Fill */}
                                {fillD && <path d={fillD} fill="url(#chartGradient)" />}

                                {/* Line Stroke */}
                                {pathD && <path d={pathD} fill="none" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                                {/* X-axis Date Labels */}
                                {points.filter((_, i) => i % 2 === 0 || i === points.length - 1).map((p, idx) => (
                                    <text key={idx} x={p.x} y={chartHeight - 12} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                                        {p.date}
                                    </text>
                                ))}

                                {/* Interactive Data Circles */}
                                {points.map((p, idx) => (
                                    <circle 
                                        key={idx} 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r="4" 
                                        fill="#6d28d9" 
                                        stroke="#ffffff" 
                                        strokeWidth="2"
                                        className="cursor-pointer hover:r-[6px] hover:fill-violet-900 transition-all"
                                    >
                                        <title>{`${p.date}\nReceita: ${p.revenue.toFixed(2)}€\nBilhetes: ${p.count}`}</title>
                                    </circle>
                                ))}
                            </svg>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Promoters Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-700">stars</span>
                        Leaderboard de Promotores
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{promoterLeaderboard.length} promotores ativos</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">Promotor / Slug</th>
                                <th className="p-4">Evento Vinculado</th>
                                <th className="p-4 text-center">Bilhetes Vendidos</th>
                                <th className="p-4 text-right">Volume de Vendas</th>
                                <th className="p-4 text-right pr-6">Comissões Acumuladas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {promoterLeaderboard.length > 0 ? promoterLeaderboard.map((promoter, index) => (
                                <tr key={promoter.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="p-4 pl-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center font-extrabold text-violet-700 text-xs">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{promoter.name}</p>
                                            <p className="text-xs text-slate-400 font-mono flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[12px]">link</span>
                                                {promoter.slug}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-700">{promoter.eventoTitulo}</p>
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-800">
                                        {promoter.salesCount}
                                    </td>
                                    <td className="p-4 text-right font-extrabold text-slate-900">
                                        {promoter.revenue.toFixed(2)}€
                                    </td>
                                    <td className="p-4 text-right font-extrabold text-violet-700 pr-6">
                                        {promoter.commissionEarned.toFixed(2)}€
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-500 font-medium italic">
                                        Sem vendas registadas por promotores até ao momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Purchases Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                        Histórico de Transações Recentes
                    </h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input 
                                type="text"
                                placeholder="Procurar transações..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none w-full sm:w-60"
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full flex items-center justify-center shrink-0">
                            {filteredPurchases.length} encontradas
                        </span>
                    </div>
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
                            {filteredPurchases.length > 0 ? filteredPurchases.map(purchase => (
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
                                        Nenhuma compra recente encontrada correspondente aos filtros.
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
