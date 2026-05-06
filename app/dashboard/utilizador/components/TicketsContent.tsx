"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface TicketItem {
    id: number;
    qrCodeToken: string;
    estado: string;
    loteNome: string;
    preco: number;
    eventoId: number;
    eventoTitulo: string;
    eventoLocal: string;
    eventoData: string;
    eventoDay: string;
    eventoMonth: string;
    eventoHora: string;
    pedidoEstado: string;
    dataCompra: string;
    usado: boolean;
}

interface TicketsContentProps {
    tickets: TicketItem[];
}

type FilterType = 'all' | 'PAGO' | 'PENDENTE' | 'USADO';

const estadoConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    PENDENTE: { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'hourglass_top' },
    PAGO: { label: 'Válido', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle' },
    USADO: { label: 'Utilizado', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200', icon: 'task_alt' },
};

export default function TicketsContent({ tickets }: TicketsContentProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

    const filteredTickets = tickets.filter(t => filter === 'all' || t.estado === filter);

    const filterButtons: { id: FilterType; label: string; count: number }[] = [
        { id: 'all', label: 'Todos', count: tickets.length },
        { id: 'PAGO', label: 'Válidos', count: tickets.filter(t => t.estado === 'PAGO').length },
        { id: 'PENDENTE', label: 'Pendentes', count: tickets.filter(t => t.estado === 'PENDENTE').length },
        { id: 'USADO', label: 'Utilizados', count: tickets.filter(t => t.estado === 'USADO').length },
    ];

    const statCards = [
        { icon: 'confirmation_number', iconBg: 'bg-[#006837]/10', iconColor: 'text-[#006837]', value: tickets.length, label: 'Total Bilhetes' },
        { icon: 'check_circle', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', value: tickets.filter(t => t.estado === 'PAGO').length, label: 'Válidos' },
        { icon: 'hourglass_top', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', value: tickets.filter(t => t.estado === 'PENDENTE').length, label: 'Pendentes' },
        { icon: 'task_alt', iconBg: 'bg-slate-100', iconColor: 'text-slate-500', value: tickets.filter(t => t.estado === 'USADO').length, label: 'Utilizados' },
    ];

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Meus Bilhetes</h1>
                <p className="text-slate-500">Consulte todos os seus bilhetes, aceda aos QR Codes e verifique o estado de cada entrada.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center mb-2`}>
                            <span className={`material-symbols-outlined ${s.iconColor} text-[20px]`}>{s.icon}</span>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
                    </div>
                ))}
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

            {/* Tickets */}
            <div className="space-y-4">
                {filteredTickets.length > 0 ? filteredTickets.map(ticket => {
                    const config = estadoConfig[ticket.estado] || estadoConfig.PENDENTE;
                    const isExpanded = expandedTicket === ticket.id;
                    return (
                        <div key={ticket.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-28 bg-gradient-to-br from-[#0b2818] to-[#006837] flex items-center justify-center p-4 md:p-6">
                                    <div className="text-center text-white">
                                        <p className="font-extrabold text-2xl md:text-3xl opacity-90">{ticket.eventoDay}</p>
                                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mt-1">{ticket.eventoMonth}</p>
                                    </div>
                                </div>
                                <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.bg} ${config.color} uppercase tracking-wider`}>
                                                <span className="material-symbols-outlined text-[12px]">{config.icon}</span>{config.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">#{ticket.id.toString().padStart(5, '0')}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{ticket.eventoTitulo}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{ticket.eventoLocal}</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{ticket.eventoHora}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#006837] text-white rounded-lg text-sm font-bold hover:bg-emerald-800 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>{isExpanded ? 'Esconder' : 'QR Code'}
                                        </button>
                                        <Link href={`/evento/${ticket.eventoId}`} className="p-2.5 border border-slate-200 rounded-lg text-slate-500 hover:text-[#006837] hover:border-[#006837]/30 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-fadeIn">
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="w-48 h-48 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 shadow-inner">
                                            <span className="material-symbols-outlined text-5xl text-[#006837]/60">qr_code_2</span>
                                            <p className="text-[10px] font-mono text-slate-400 text-center px-2 break-all">{ticket.qrCodeToken.slice(0, 20)}...</p>
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tipo de Bilhete</p><p className="text-sm font-semibold text-slate-800">{ticket.loteNome}</p></div>
                                            <div><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Preço</p><p className="text-sm font-semibold text-slate-800">{ticket.preco.toFixed(2)}€</p></div>
                                            <div><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Data de Compra</p><p className="text-sm font-semibold text-slate-800">{ticket.dataCompra}</p></div>
                                            <div><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Estado do Pedido</p><p className="text-sm font-semibold text-slate-800">{ticket.pedidoEstado}</p></div>
                                        </div>
                                    </div>
                                    {ticket.estado === 'PAGO' && (
                                        <div className="mt-6 flex items-center gap-2 text-[#006837] bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                                            <span className="material-symbols-outlined text-[18px]">info</span>
                                            <p className="text-xs font-medium">Apresente este QR Code na entrada do evento para validar o seu acesso.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">confirmation_number</span>
                        <p className="text-lg font-semibold text-slate-600 mb-2">{filter === 'all' ? 'Nenhum bilhete encontrado' : `Nenhum bilhete ${filterButtons.find(f => f.id === filter)?.label.toLowerCase()}`}</p>
                        <p className="text-sm text-slate-400 mb-6">Explore os eventos disponíveis e garanta o seu acesso.</p>
                        <Link href="/eventos" className="inline-flex items-center gap-2 bg-[#006837] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-emerald-800 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-[18px]">explore</span>Explorar Eventos
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
