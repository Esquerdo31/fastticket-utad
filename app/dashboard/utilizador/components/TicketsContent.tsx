"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface TicketItem {
    id: number;
    qrCodeToken: string;
    qrCodeBase64?: string;
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
    ticketCorFundo?: string;
    ticketCorTexto?: string;
    ticketMensagem?: string;
    ticketBackgroundUrl?: string | null;
    ticketTemplate?: string;
    ticketLogoUrl?: string | null;
    ticketGlow?: boolean;
    participanteNome?: string;
}

const handleDownloadPDF = (ticket: TicketItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const bgCor = ticket.ticketCorFundo || '#ffffff';
    const textCor = ticket.ticketCorTexto || '#000000';
    const msg = ticket.ticketMensagem || 'Apresente este bilhete impresso ou no telemóvel na entrada do recinto.';
    const hasBg = !!ticket.ticketBackgroundUrl;
    const bgUrl = ticket.ticketBackgroundUrl || '';
    const template = ticket.ticketTemplate || 'classic';
    const logoUrl = ticket.ticketLogoUrl || '';
    const glow = !!ticket.ticketGlow;
    const participante = ticket.participanteNome || 'Participante';

    printWindow.document.write(`
        <html>
        <head>
            <title>Bilhete - ${ticket.eventoTitulo}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    font-family: 'Outfit', sans-serif;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    transition: background 0.3s;
                }
                
                /* Page Background themes */
                body.page-glassmorphism {
                    background: radial-gradient(circle at 20% 20%, #2e1065, #090514 80%);
                }
                body.page-neon {
                    background: #030008;
                }
                body.page-minimalist {
                    background: #f8fafc;
                }
                body.page-classic {
                    background: #f1f5f9;
                }

                .ticket-card {
                    width: 350px;
                    min-height: 520px;
                    border-radius: 24px;
                    padding: 28px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }

                /* Template styles */
                .template-classic {
                    background-color: ${bgCor};
                    color: ${textCor};
                    border: 1px solid rgba(0, 0, 0, 0.08);
                }
                .template-classic .cutout {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #f1f5f9;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                }
                .template-classic .cutout-left { left: -10px; }
                .template-classic .cutout-right { right: -10px; }

                .template-glassmorphism {
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                }

                .template-neon {
                    background: #09090b;
                    color: #ffffff;
                    border: 2px solid ${bgCor === '#ffffff' ? '#8b5cf6' : bgCor};
                }

                .template-minimalist {
                    background: #ffffff;
                    color: #0f172a;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }

                /* Custom background image overlay */
                .has-bg-image {
                    background-image: linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.85)), url('${bgUrl}');
                    background-size: cover;
                    background-position: center;
                    color: #ffffff !important;
                    border: none !important;
                }

                /* Glow styling */
                .glow-effect {
                    box-shadow: 0 0 30px ${bgCor === '#ffffff' ? '#8b5cf6' : bgCor} !important;
                }
                
                @media print {
                    body {
                        background-color: #ffffff !important;
                        background: none !important;
                    }
                    .ticket-card {
                        box-shadow: none !important;
                        page-break-inside: avoid;
                    }
                    .template-glassmorphism {
                        background: #1e1b4b !important;
                        color: #ffffff !important;
                        border: 1px solid rgba(255,255,255,0.15) !important;
                    }
                    .template-neon {
                        background: #09090b !important;
                        border: 2px solid ${bgCor === '#ffffff' ? '#8b5cf6' : bgCor} !important;
                    }
                    .ticket-card.has-bg-image {
                        border: none !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .template-classic .cutout {
                        background-color: #ffffff !important;
                    }
                }
            </style>
        </head>
        <body class="page-${template}">
            <div class="ticket-card template-${template} ${hasBg ? 'has-bg-image' : ''} ${glow ? 'glow-effect' : ''}">
                ${template === 'classic' && !hasBg ? `
                    <div class="cutout cutout-left"></div>
                    <div class="cutout cutout-right"></div>
                ` : ''}
                
                <div class="header" style="width: 100%; text-align: center; border-bottom: 1px ${template === 'classic' ? 'dashed' : 'solid'} ${template === 'glassmorphism' ? 'rgba(255,255,255,0.1)' : template === 'neon' ? 'rgba(139,92,246,0.2)' : 'rgba(0,0,0,0.06)'}; padding-bottom: 18px; display: flex; flex-direction: column; items: center; box-sizing: border-box;">
                    ${logoUrl ? `
                        <img src="${logoUrl}" alt="Logo" style="height: 38px; object-fit: contain; margin-bottom: 10px; max-width: 100%;" />
                    ` : `
                        <div class="logo-text" style="font-size: 10px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; ${template === 'neon' ? 'color: #c084fc;' : 'opacity: 0.6;'}">FASTTICKET</div>
                    `}
                    <h1 style="font-size: 18px; font-weight: 800; margin: 4px 0; line-height: 1.25; text-align: center; ${template === 'neon' ? 'background: linear-gradient(to right, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;' : ''}">${ticket.eventoTitulo}</h1>
                    <p style="font-size: 11px; margin: 2px 0 0 0; opacity: 0.85; text-align: center;">${ticket.eventoLocal}</p>
                    <p style="font-size: 10px; margin: 4px 0 0 0; opacity: 0.7; font-weight: 600; text-align: center;">${ticket.eventoData} &bull; ${ticket.eventoHora}</p>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center; margin: 20px 0; width: 100%; box-sizing: border-box;">
                    <div style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; opacity: 0.6; margin-bottom: 6px;">Participante</div>
                    <div style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; text-align: center;">${participante}</div>
                    
                    <div style="background: #ffffff; padding: 12px; border-radius: 18px; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.03); display: inline-flex; justify-content: center; align-items: center; margin-bottom: 14px;">
                        <img src="${ticket.qrCodeBase64 || ''}" alt="QR Code" style="width: 160px; height: 160px; display: block;" />
                    </div>
                    
                    <div style="font-family: monospace; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 6px; ${template === 'neon' ? 'background: rgba(139,92,246,0.15); color: #c084fc; border: 1px solid rgba(139,92,246,0.25);' : template === 'glassmorphism' ? 'background: rgba(255,255,255,0.1); color: #ffffff;' : 'background: #f1f5f9; color: #334155;'}">
                        ${ticket.qrCodeToken.substring(0, 8).toUpperCase()}
                    </div>
                </div>

                <div style="width: 100%; border-top: 1px ${template === 'classic' ? 'dashed' : 'solid'} ${template === 'glassmorphism' ? 'rgba(255,255,255,0.1)' : template === 'neon' ? 'rgba(139,92,246,0.2)' : 'rgba(0,0,0,0.06)'}; padding-top: 16px; text-align: center; margin-top: auto; box-sizing: border-box;">
                    <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; ${template === 'neon' ? 'color: #c084fc;' : ''}">${ticket.loteNome} &bull; ${ticket.preco.toFixed(2)}€</p>
                    <p style="font-size: 9px; line-height: 1.4; opacity: 0.75; margin: 0;">${msg}</p>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

interface TicketsContentProps {
    tickets: TicketItem[];
}

type FilterType = 'all' | 'PAGO' | 'PENDENTE' | 'USADO' | 'EXPIRADO';

const estadoConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    PENDENTE: { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'hourglass_top' },
    PAGO: { label: 'Válido', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle' },
    USADO: { label: 'Utilizado', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200', icon: 'task_alt' },
    EXPIRADO: { label: 'Expirado', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: 'cancel' },
};

export default function TicketsContent({ tickets }: TicketsContentProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

    const filteredTickets = tickets.filter(t => {
        const isTicketExpired = (t as any).isExpired && t.estado !== 'USADO';
        if (filter === 'all') return true;
        if (filter === 'PAGO') return t.estado === 'PAGO' && !isTicketExpired;
        if (filter === 'EXPIRADO') return isTicketExpired;
        return t.estado === filter;
    });

    const filterButtons: { id: FilterType; label: string; count: number }[] = [
        { id: 'all', label: 'Todos', count: tickets.length },
        { id: 'PAGO', label: 'Válidos', count: tickets.filter(t => t.estado === 'PAGO' && !(t as any).isExpired).length },
        { id: 'PENDENTE', label: 'Pendentes', count: tickets.filter(t => t.estado === 'PENDENTE').length },
        { id: 'USADO', label: 'Utilizados', count: tickets.filter(t => t.estado === 'USADO').length },
        { id: 'EXPIRADO', label: 'Expirados', count: tickets.filter(t => (t as any).isExpired && t.estado !== 'USADO').length },
    ];

    const statCards = [
        { icon: 'confirmation_number', iconBg: 'bg-[#006837]/10', iconColor: 'text-[#006837]', value: tickets.length, label: 'Total Bilhetes' },
        { icon: 'check_circle', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', value: tickets.filter(t => t.estado === 'PAGO' && !(t as any).isExpired).length, label: 'Válidos' },
        { icon: 'hourglass_top', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', value: tickets.filter(t => t.estado === 'PENDENTE').length, label: 'Pendentes' },
        { icon: 'cancel', iconBg: 'bg-rose-50', iconColor: 'text-rose-600', value: tickets.filter(t => (t as any).isExpired && t.estado !== 'USADO').length, label: 'Expirados' },
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
                    <button type="button" key={btn.id} onClick={() => setFilter(btn.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === btn.id ? 'bg-[#006837] text-white shadow-md shadow-[#006837]/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#006837]/30 hover:text-[#006837]'}`}>
                        {btn.label}<span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === btn.id ? 'bg-white/20' : 'bg-slate-100'}`}>{btn.count}</span>
                    </button>
                ))}
            </div>

            {/* Tickets */}
            <div className="space-y-4">
                {filteredTickets.length > 0 ? filteredTickets.map(ticket => {
                    const isTicketExpired = (ticket as any).isExpired && ticket.estado !== 'USADO';
                    const resolvedEstado = isTicketExpired ? 'EXPIRADO' : ticket.estado;
                    const config = estadoConfig[resolvedEstado] || estadoConfig.PENDENTE;
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
                                        <button type="button" onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
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
                                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                                        
                                        {/* Styled Ticket Card */}
                                        <div className="w-full max-w-[280px] bg-slate-900 rounded-2xl p-6 border border-slate-800 relative overflow-hidden flex items-center justify-center shrink-0 mx-auto lg:mx-0 shadow-lg">
                                            {ticket.ticketTemplate === 'glassmorphism' && (
                                                <>
                                                    <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-violet-600/30 rounded-full blur-[25px] opacity-40 animate-pulse" />
                                                    <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-fuchsia-600/30 rounded-full blur-[25px] opacity-40 animate-pulse" />
                                                </>
                                            )}

                                            <div 
                                                style={{ 
                                                    backgroundColor: (ticket.ticketTemplate === 'glassmorphism' || ticket.ticketTemplate === 'neon') ? undefined : (ticket.ticketBackgroundUrl ? undefined : ticket.ticketCorFundo),
                                                    color: (ticket.ticketTemplate === 'glassmorphism' || ticket.ticketTemplate === 'neon' || ticket.ticketBackgroundUrl) ? '#ffffff' : ticket.ticketCorTexto,
                                                    backgroundImage: ticket.ticketBackgroundUrl ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.85)), url(${ticket.ticketBackgroundUrl})` : undefined,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    borderColor: ticket.ticketTemplate === 'neon' ? (ticket.ticketCorFundo || '#8b5cf6') : undefined,
                                                }}
                                                className={`w-full rounded-2xl flex flex-col p-5 font-sans relative border text-center ${
                                                    ticket.ticketTemplate === 'glassmorphism' 
                                                        ? 'bg-white/10 backdrop-blur-md border-white/20 shadow-xl' 
                                                        : ticket.ticketTemplate === 'neon'
                                                            ? 'bg-slate-950/90 border-2 shadow-xl shadow-violet-500/10'
                                                            : ticket.ticketTemplate === 'minimalist'
                                                                ? 'bg-white text-slate-900 border-slate-200 shadow-md'
                                                                : 'border-slate-200/60 shadow-md'
                                                } ${
                                                    ticket.ticketGlow ? 'shadow-[0_0_20px_rgba(139,92,246,0.4)]' : ''
                                                }`}
                                            >
                                                {ticket.ticketTemplate === 'classic' && !ticket.ticketBackgroundUrl && (
                                                    <>
                                                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-900 rounded-full border-r border-slate-200/60 z-10" />
                                                        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-900 rounded-full border-l border-slate-200/60 z-10" />
                                                    </>
                                                )}

                                                <div className={`pb-3 flex flex-col items-center border-b ${
                                                    ticket.ticketTemplate === 'glassmorphism' ? 'border-white/10' : ticket.ticketTemplate === 'neon' ? 'border-violet-500/20' : ticket.ticketTemplate === 'minimalist' ? 'border-slate-100' : 'border-dashed border-slate-300/80'
                                                }`}>
                                                    {ticket.ticketLogoUrl ? (
                                                        <img src={ticket.ticketLogoUrl} alt="Logo" className="h-8 object-contain mb-1.5 max-w-full" />
                                                    ) : (
                                                        <div className={`text-[9px] uppercase font-black tracking-[0.25em] ${ticket.ticketTemplate === 'neon' ? 'text-violet-400' : 'opacity-60'}`}>FASTTICKET</div>
                                                    )}
                                                    <h4 className={`text-sm font-bold truncate mt-1 max-w-full ${ticket.ticketTemplate === 'neon' ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-extrabold' : ''}`}>
                                                        {ticket.eventoTitulo}
                                                    </h4>
                                                    <p className="text-[9px] opacity-75 truncate max-w-full">{ticket.eventoLocal}</p>
                                                </div>

                                                <div className="flex flex-col items-center my-4 space-y-3">
                                                    <div className="text-center">
                                                        <p className="text-[8px] uppercase tracking-widest opacity-60">Participante</p>
                                                        <p className="text-xs font-bold tracking-wide uppercase mt-0.5">{ticket.participanteNome || 'Participante'}</p>
                                                    </div>

                                                    <div className="w-28 h-28 bg-white rounded-xl p-2 flex items-center justify-center shadow">
                                                        {ticket.qrCodeBase64 ? (
                                                            <img src={ticket.qrCodeBase64} alt="QR Code" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-6xl text-slate-800">qr_code_2</span>
                                                        )}
                                                    </div>
                                                    <div className={`text-[10px] font-bold px-3 py-1 rounded shadow-sm font-mono tracking-widest ${ticket.ticketTemplate === 'neon' ? 'bg-violet-950 text-violet-300 border border-violet-500/30' : 'bg-slate-100 text-slate-800'}`}>
                                                        {ticket.qrCodeToken.substring(0, 8).toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className={`border-t pt-3 mt-auto text-center ${
                                                    ticket.ticketTemplate === 'glassmorphism' ? 'border-white/10' : ticket.ticketTemplate === 'neon' ? 'border-violet-500/20' : ticket.ticketTemplate === 'minimalist' ? 'border-slate-100' : 'border-dashed border-slate-300/80'
                                                }`}>
                                                    <p className="text-[8px] uppercase tracking-widest opacity-60 mb-0.5">Lote: {ticket.loteNome}</p>
                                                    <p className="text-[8px] leading-relaxed opacity-70 truncate px-1">
                                                        {ticket.ticketMensagem || 'Apresente este bilhete impresso ou no telemóvel na entrada do recinto.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ticket Details & Action buttons */}
                                        <div className="flex-1 w-full space-y-6">
                                            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tipo de Bilhete</p>
                                                    <p className="text-sm font-bold text-slate-800">{ticket.loteNome}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Preço Pago</p>
                                                    <p className="text-sm font-bold text-slate-800">{ticket.preco.toFixed(2)}€</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Data de Compra</p>
                                                    <p className="text-sm font-semibold text-slate-800">{ticket.dataCompra}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Estado do Pedido</p>
                                                    <p className="text-sm font-semibold text-slate-800">{ticket.pedidoEstado}</p>
                                                </div>
                                            </div>

                                            {ticket.estado === 'PAGO' && (
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1 flex items-center gap-2 text-[#006837] bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                                                        <span className="material-symbols-outlined text-[18px]">info</span>
                                                        <p className="text-xs font-medium">Apresente este QR Code na entrada do evento para validar o seu acesso.</p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDownloadPDF(ticket)}
                                                        className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#006837] text-[#006837] hover:bg-[#006837] hover:text-white rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                                        Descarregar Bilhete (PDF)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
