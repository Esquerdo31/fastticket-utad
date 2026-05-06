"use client";

import React, { useState } from 'react';

interface OrderItem {
    id: number;
    dataPedido: string;
    valorTotal: number;
    estado: string;
    numBilhetes: number;
    eventNames: string[];
    metodoPagamento: string | null;
    transacaoId: string | null;
    dataPagamento: string | null;
}

interface BillingSummary {
    totalGasto: number;
    totalPedidos: number;
    totalBilhetes: number;
}

interface BillingContentProps {
    orders: OrderItem[];
    summary: BillingSummary;
}

type FilterType = 'all' | 'PAGO' | 'PENDENTE' | 'CANCELADO';

const estadoConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    PENDENTE: { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'hourglass_top' },
    PAGO: { label: 'Pago', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle' },
    CANCELADO: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: 'cancel' },
};

export default function BillingContent({ orders, summary }: BillingContentProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    const filteredOrders = orders.filter(o => filter === 'all' || o.estado === filter);

    const filterButtons: { id: FilterType; label: string; count: number }[] = [
        { id: 'all', label: 'Todos', count: orders.length },
        { id: 'PAGO', label: 'Pagos', count: orders.filter(o => o.estado === 'PAGO').length },
        { id: 'PENDENTE', label: 'Pendentes', count: orders.filter(o => o.estado === 'PENDENTE').length },
        { id: 'CANCELADO', label: 'Cancelados', count: orders.filter(o => o.estado === 'CANCELADO').length },
    ];

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Faturação</h1>
                <p className="text-slate-500">Histórico de pedidos, pagamentos e resumo financeiro da sua conta.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-[#0b2818] via-[#004d29] to-[#006837] rounded-xl p-6 text-white relative overflow-hidden shadow-lg shadow-[#0b2818]/10">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-emerald-300 text-[20px]">account_balance_wallet</span>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Total Gasto</p>
                        </div>
                        <p className="text-3xl font-extrabold">{summary.totalGasto.toFixed(2)}€</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#006837]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#006837] text-[18px]">receipt_long</span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Pedidos</p>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{summary.totalPedidos}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#006837]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#006837] text-[18px]">confirmation_number</span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bilhetes</p>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{summary.totalBilhetes}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {filterButtons.map(btn => (
                    <button key={btn.id} onClick={() => setFilter(btn.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === btn.id ? 'bg-[#006837] text-white shadow-md shadow-[#006837]/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#006837]/30 hover:text-[#006837]'}`}>
                        {btn.label}<span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === btn.id ? 'bg-white/20' : 'bg-slate-100'}`}>{btn.count}</span>
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? filteredOrders.map(order => {
                    const config = estadoConfig[order.estado] || estadoConfig.PENDENTE;
                    const isExpanded = expandedOrder === order.id;
                    return (
                        <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full text-left p-5 md:p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#006837]">receipt_long</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-bold text-slate-900">Pedido #{order.id.toString().padStart(5, '0')}</h3>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.color} uppercase tracking-wider`}>
                                                    <span className="material-symbols-outlined text-[11px]">{config.icon}</span>{config.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">{order.eventNames.join(', ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-extrabold text-slate-900">{order.valorTotal.toFixed(2)}€</p>
                                            <p className="text-[11px] text-slate-400">{order.dataPedido}</p>
                                        </div>
                                        <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-fadeIn">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Nº Bilhetes</p>
                                            <p className="text-sm font-semibold text-slate-800">{order.numBilhetes}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Método Pagamento</p>
                                            <p className="text-sm font-semibold text-slate-800">{order.metodoPagamento || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">ID Transação</p>
                                            <p className="text-sm font-semibold text-slate-800 font-mono">{order.transacaoId ? order.transacaoId.slice(0, 16) + '...' : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Data Pagamento</p>
                                            <p className="text-sm font-semibold text-slate-800">{order.dataPagamento || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">receipt_long</span>
                        <p className="text-lg font-semibold text-slate-600 mb-2">Nenhum pedido encontrado</p>
                        <p className="text-sm text-slate-400">Os seus pedidos e faturas aparecerão aqui após a compra de bilhetes.</p>
                    </div>
                )}
            </div>
        </>
    );
}
