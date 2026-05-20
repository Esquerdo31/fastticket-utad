"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface TicketItem {
    id: number;
    qrCodeToken: string;
    qrCodeBase64: string;
    loteNome: string;
    estado: string;
    preco: number;
    eventoTitulo: string;
    eventoLocal: string;
    eventoData: string;
    eventoHora: string;
    ticketCorFundo?: string;
    ticketCorTexto?: string;
    ticketMensagem?: string;
}

const handleDownloadPDF = (ticket: TicketItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const bgCor = ticket.ticketCorFundo || '#ffffff';
    const textCor = ticket.ticketCorTexto || '#000000';
    const msg = ticket.ticketMensagem || 'Apresente este bilhete impresso ou no telemóvel na entrada do recinto.';

    printWindow.document.write(`
        <html>
        <head>
            <title>Bilhete - ${ticket.eventoTitulo}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f1f5f9;
                    font-family: 'Outfit', sans-serif;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .ticket-container {
                    width: 380px;
                    background-color: ${bgCor};
                    color: ${textCor};
                    border-radius: 24px;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                    padding: 30px;
                    border: 1px solid rgba(0,0,0,0.08);
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }
                
                .cutout-left, .cutout-right {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #f1f5f9;
                    position: absolute;
                    top: 250px;
                }
                .cutout-left { left: -10px; }
                .cutout-right { right: -10px; }
                
                .header {
                    width: 100%;
                    text-align: center;
                    border-bottom: 2px dashed rgba(0, 0, 0, 0.12);
                    padding-bottom: 24px;
                    margin-bottom: 24px;
                }
                
                .header h1 {
                    margin: 8px 0 4px 0;
                    font-size: 20px;
                    font-weight: 800;
                    line-height: 1.3;
                }
                
                .header p {
                    margin: 0;
                    font-size: 13px;
                    opacity: 0.8;
                }
                
                .logo-text {
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 800;
                    letter-spacing: 2px;
                    opacity: 0.6;
                }
                
                .qr-section {
                    background-color: #ffffff;
                    padding: 12px;
                    border-radius: 16px;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .qr-section img {
                    width: 180px;
                    height: 180px;
                    display: block;
                }
                
                .details {
                    width: 100%;
                    text-align: center;
                    margin-bottom: 24px;
                }
                
                .lote-name {
                    font-size: 14px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin: 0 0 4px 0;
                }
                
                .token-id {
                    font-family: monospace;
                    font-size: 10px;
                    opacity: 0.55;
                    margin: 0;
                    word-break: break-all;
                }
                
                .footer-msg {
                    width: 100%;
                    border-top: 2px dashed rgba(0, 0, 0, 0.12);
                    padding-top: 20px;
                    text-align: center;
                    font-size: 11px;
                    line-height: 1.5;
                    opacity: 0.85;
                }
                
                @media print {
                    body {
                        background-color: #ffffff;
                    }
                    .ticket-container {
                        box-shadow: none;
                        border: 1px solid rgba(0,0,0,0.15);
                        page-break-inside: avoid;
                    }
                    .cutout-left, .cutout-right {
                        background-color: #ffffff;
                    }
                }
            </style>
        </head>
        <body>
            <div class="ticket-container">
                <div class="cutout-left"></div>
                <div class="cutout-right"></div>
                
                <div class="header">
                    <div class="logo-text">FASTTICKET</div>
                    <h1>${ticket.eventoTitulo}</h1>
                    <p>${ticket.eventoLocal} &bull; ${ticket.eventoHora}</p>
                    <p style="margin-top: 4px; font-weight: 600;">${ticket.eventoData}</p>
                </div>
                
                <div class="qr-section">
                    <img src="${ticket.qrCodeBase64 || ''}" alt="QR Code" />
                </div>
                
                <div class="details">
                    <p class="lote-name">${ticket.loteNome}</p>
                    <p class="token-id">TOKEN: ${ticket.qrCodeToken}</p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; font-weight: 600;">Preço: ${ticket.preco.toFixed(2)}€ (PAGO)</p>
                </div>
                
                <div class="footer-msg">
                    ${msg}
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

interface EventItem {
    id: number;
    title: string;
    location: string;
    date: string;
    day: string;
    month: string;
    time: string;
    tickets?: TicketItem[];
}

interface SuggestionItem {
    id: number;
    title: string;
    description: string;
    date: string;
}

interface DashboardContentProps {
    userName: string;
    nextEvents: EventItem[];
    suggestions: SuggestionItem[];
    parcerias: any[];
    onTabChange: (tab: 'dashboard' | 'tickets' | 'billing' | 'profile' | 'promotor') => void;
}

export default function DashboardContent({ userName, nextEvents, suggestions, parcerias = [], onTabChange }: DashboardContentProps) {
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const pendingInvites = parcerias.filter(p => p.estado === 'PENDENTE');

    return (
        <>
            {/* Notification for Promoter Invitation */}
            {pendingInvites.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-start gap-4 shadow-sm animate-fadeIn">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                        <span className="material-symbols-outlined text-[24px]">campaign</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">Novo Convite de Afiliado / Promotor!</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Foste convidado para promover o evento <strong className="text-[#006837]">{pendingInvites[0].eventoTitulo}</strong> e ganhar comissões por venda.
                            {pendingInvites.length > 1 && ` Tens mais ${pendingInvites.length - 1} convite(s) pendente(s).`}
                        </p>
                    </div>
                    <button 
                        onClick={() => onTabChange('promotor')}
                        className="bg-[#006837] hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-800/10"
                    >
                        Ver Convites
                    </button>
                </div>
            )}

            {/* Welcome Section */}
            <section className="mb-10">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0b2818] via-[#004d29] to-[#006837] p-8 lg:p-12 text-white shadow-xl shadow-[#0b2818]/10">
                    {/* Geometric Academic Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                    
                    <div className="relative z-10">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-300 mb-2">Painel Pessoal</p>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">Bem-vindo(a), {userName.split(" ")[0]}.</h1>
                        <p className="text-lg opacity-90 max-w-xl leading-relaxed">
                            {nextEvents.length > 0 
                                ? `Tens ${nextEvents.length} evento(s) agendado(s). O teu acesso digital académico está garantido.`
                                : `Ainda não compraste nenhum bilhete. Visita a página de eventos para explorares a agenda!`}
                        </p>
                    </div>
                    {/* Decorative Icon */}
                    <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] opacity-10 rotate-12 select-none">school</span>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Next Events Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Próximos Eventos</h2>
                        <Link href="/eventos" className="text-[#006837] font-semibold text-sm hover:underline">Ver Agenda Completa</Link>
                    </div>

                    <div className="space-y-4">
                        {nextEvents.length > 0 ? nextEvents.map((event) => (
                            <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col md:flex-row group">
                                <div className="md:w-48 h-32 md:h-auto relative overflow-hidden bg-gradient-to-br from-[#0b2818] to-[#006837] flex items-center justify-center p-4">
                                    <div className="text-center text-white">
                                        <p className="font-extrabold text-3xl opacity-90">{event.day}</p>
                                        <p className="text-xs uppercase tracking-widest font-bold opacity-70 mt-1">{event.month}</p>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-250 uppercase tracking-wider">
                                                BILHETE PAGO
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#006837] transition-colors">{event.title}</h3>
                                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="material-symbols-outlined text-[#006837] text-[18px]">schedule</span>
                                            <span className="text-sm font-semibold">{event.time}</span>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedEvent(event)}
                                            className="flex items-center gap-2 bg-[#006837] text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform hover:bg-[#00522b] cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                            Aceder QR Code
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">confirmation_number</span>
                                <p className="text-slate-500 font-medium">Nenhum evento pago encontrado.</p>
                                <Link href="/eventos" className="inline-block mt-4 text-[#006837] font-bold hover:underline">Explorar Eventos</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Suggestions Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Recomendações</h2>
                    <div className="space-y-4">
                        {suggestions.map((suggestion) => (
                            <Link href={`/evento/${suggestion.id}`} key={suggestion.id} className="block bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-[#006837]/40 transition-all group">
                                <div className="h-32 relative bg-gradient-to-br from-[#0b2818] to-[#006837] p-6 flex items-center justify-center text-center">
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                            Recomendado
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-white leading-tight drop-shadow-md">{suggestion.title}</h4>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-1.5 text-[#006837] text-xs font-bold mb-2">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {suggestion.date}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{suggestion.description}</p>
                                    <div className="w-full py-2 border border-[#006837] text-[#006837] text-xs font-bold rounded-lg group-hover:bg-[#006837] group-hover:text-white transition-colors text-center">
                                        Ver Detalhes
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Acesso QR Code Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative max-h-[90vh] animate-scaleUp">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors z-10 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>

                        {/* Modal Header */}
                        <div className="p-6 pb-4 border-b border-slate-100 bg-[#0b2818] text-white">
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                Bilhetes Digitais
                            </span>
                            <h3 className="text-xl font-bold mt-2 pr-8 leading-tight">{selectedEvent.title}</h3>
                            <div className="flex items-center gap-1.5 text-emerald-300 text-xs mt-2">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                <span>{selectedEvent.location}</span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 max-h-[55vh] divide-y divide-slate-100">
                            {selectedEvent.tickets && selectedEvent.tickets.length > 0 ? (
                                selectedEvent.tickets.map((ticket, index) => (
                                    <div key={ticket.id} className={`${index > 0 ? 'pt-6' : ''} flex flex-col items-center`}>
                                        <div className="flex justify-between items-center w-full mb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                Bilhete {index + 1} de {selectedEvent.tickets?.length}
                                            </span>
                                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-250">
                                                {ticket.loteNome}
                                            </span>
                                        </div>

                                        {/* QR Code Container */}
                                        <div className="w-56 h-56 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center p-3 shadow-inner mb-4">
                                            {ticket.qrCodeBase64 ? (
                                                <img 
                                                    src={ticket.qrCodeBase64} 
                                                    alt={`Código QR do Bilhete ${index + 1}`} 
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <span className="material-symbols-outlined text-5xl text-[#006837]/60 animate-pulse">qr_code_2</span>
                                                    <p className="text-[10px] font-mono text-slate-400 text-center px-2 break-all">{ticket.qrCodeToken.slice(0, 20)}...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center gap-2 mt-1">
                                            <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded border border-slate-150 break-all max-w-[280px] text-center">
                                                ID: #{ticket.id.toString().padStart(5, '0')} | {ticket.qrCodeToken.slice(0, 16)}...
                                            </p>
                                            <button 
                                                onClick={() => handleDownloadPDF(ticket)}
                                                className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 border border-[#006837] text-[#006837] hover:bg-[#006837] hover:text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                                                Descarregar PDF
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">Nenhum bilhete encontrado para este evento.</p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={() => setSelectedEvent(null)}
                                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                            >
                                Fechar
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedEvent(null);
                                    onTabChange('tickets');
                                }}
                                className="flex-1 py-2.5 bg-[#006837] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                Meus Bilhetes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
