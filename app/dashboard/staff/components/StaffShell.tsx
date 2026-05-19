"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';
import { validarBilhete, getEventCheckins, getSimulatedTickets } from '@/app/actions/tickets';

interface StaffShellProps {
    userName: string;
    eventos: any[];
    user: {
        id: number;
        nome: string;
        email: string;
        role: string;
    };
}

export default function StaffShell({ userName, eventos, user }: StaffShellProps) {
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [qrCodeToken, setQrCodeToken] = useState('');
    const [dispositivoId, setDispositivoId] = useState('browser-staff-' + user.id);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'warning' | 'error' | null;
        message: string;
        details?: any;
    }>({ type: null, message: '' });

    // History and Simulation states
    const [checkinHistory, setCheckinHistory] = useState<any[]>([]);
    const [simulatedTickets, setSimulatedTickets] = useState<any[]>([]);
    const [loadingSubData, setLoadingSubData] = useState(false);

    // Dynamic stats
    const [dynamicCheckinCount, setDynamicCheckinCount] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when event is selected
    useEffect(() => {
        if (selectedEvent) {
            setDynamicCheckinCount(selectedEvent.checkinsCount || 0);
            loadEventData(selectedEvent.id);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            setFeedback({ type: null, message: '' });
            setQrCodeToken('');
        }
    }, [selectedEvent]);

    const loadEventData = async (eventId: number) => {
        setLoadingSubData(true);
        const [histRes, simRes] = await Promise.all([
            getEventCheckins(eventId),
            getSimulatedTickets(eventId)
        ]);

        if (histRes.success) {
            setCheckinHistory(histRes.checkins || []);
        }
        if (simRes.success) {
            setSimulatedTickets(simRes.tickets || []);
        }
        setLoadingSubData(false);
    };

    const handleLogout = async () => {
        await logoutUser();
        router.push('/login');
    };

    const handleValidate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!qrCodeToken.trim()) return;

        setLoading(true);
        setFeedback({ type: null, message: '' });

        const res = await validarBilhete({
            qrCodeToken: qrCodeToken.trim(),
            dispositivoId
        });

        if (res.success) {
            setFeedback({
                type: 'success',
                message: res.message || 'Check-in realizado com sucesso!',
                details: res.bilhete
            });
            // Update counter
            setDynamicCheckinCount(prev => prev + 1);
            // Clear input
            setQrCodeToken('');
            // Reload history and simulated list
            loadEventData(selectedEvent.id);
        } else {
            if (res.alreadyUsed) {
                setFeedback({
                    type: 'warning',
                    message: res.message || 'Este bilhete já foi utilizado!',
                    details: { usedAt: res.usedAt }
                });
            } else {
                setFeedback({
                    type: 'error',
                    message: res.message || 'Erro ao validar o bilhete.'
                });
            }
        }
        setLoading(false);
        // Refocus input
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const simulateScan = (token: string) => {
        setQrCodeToken(token);
        // Delay a tiny bit so they see the token fill, then validate
        setTimeout(() => {
            setQrCodeToken(token);
            // Trigger validation directly
            validateTokenDirectly(token);
        }, 200);
    };

    const validateTokenDirectly = async (token: string) => {
        setLoading(true);
        setFeedback({ type: null, message: '' });

        const res = await validarBilhete({
            qrCodeToken: token.trim(),
            dispositivoId
        });

        if (res.success) {
            setFeedback({
                type: 'success',
                message: res.message || 'Check-in realizado com sucesso!',
                details: res.bilhete
            });
            setDynamicCheckinCount(prev => prev + 1);
            setQrCodeToken('');
            loadEventData(selectedEvent.id);
        } else {
            if (res.alreadyUsed) {
                setFeedback({
                    type: 'warning',
                    message: res.message || 'Este bilhete já foi utilizado!',
                    details: { usedAt: res.usedAt }
                });
            } else {
                setFeedback({
                    type: 'error',
                    message: res.message || 'Erro ao validar o bilhete.'
                });
            }
        }
        setLoading(false);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    return (
        <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans">
            {/* Top Bar */}
            <header className="fixed top-0 z-50 w-full bg-white shadow-sm flex justify-between items-center px-4 sm:px-6 py-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 font-bold text-2xl">qr_code_scanner</span>
                    <span className="text-lg font-black text-slate-900 tracking-tight">FastTicket Staff</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{userName}</span>
                    <button 
                        onClick={handleLogout} 
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span> Sair
                    </button>
                </div>
            </header>

            <main className="pt-20 px-4 max-w-4xl mx-auto pb-12">
                {!selectedEvent ? (
                    /* Event Selector Screen */
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-black text-slate-900">Validar Entradas</h1>
                            <p className="text-sm text-slate-500 mt-1">Selecione o evento no qual está de serviço para iniciar as validações.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {eventos.map((ev) => (
                                <div 
                                    key={ev.id} 
                                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group"
                                    onClick={() => setSelectedEvent(ev)}
                                >
                                    <div className="space-y-1">
                                        <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">{ev.titulo}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">calendar_month</span>
                                                {ev.dataInicio}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {ev.localizacao}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Check-ins efetuados</p>
                                            <p className="text-sm font-bold text-slate-700">{ev.checkinsCount} validados</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">arrow_forward</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Ticket Validation Screen */
                    <div className="space-y-6 animate-fadeIn">
                        {/* Back navigation & Event Header */}
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setSelectedEvent(null)}
                                className="p-2 hover:bg-slate-200 active:scale-95 rounded-full transition-all text-slate-600 flex items-center"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Leitor Ativo</span>
                                <h1 className="text-lg sm:text-xl font-black text-slate-950 truncate max-w-[280px] sm:max-w-md mt-1">{selectedEvent.titulo}</h1>
                            </div>
                        </div>

                        {/* Scanner / Validation Box */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                            {/* Counter Bar */}
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest">Contador de Entradas</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">Total de acessos registados neste telemóvel</p>
                                </div>
                                <span className="bg-emerald-600 text-white text-xl font-black px-4 py-1.5 rounded-xl">{dynamicCheckinCount}</span>
                            </div>

                            {/* Validation Feedback Alert */}
                            {feedback.type && (
                                <div className={`p-5 rounded-2xl border text-sm font-semibold flex items-start gap-3.5 animate-fadeIn ${
                                    feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                    feedback.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                    'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {feedback.type === 'success' ? 'check_circle' :
                                         feedback.type === 'warning' ? 'warning' : 'cancel'}
                                    </span>
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-base leading-tight">{feedback.message}</p>
                                        
                                        {feedback.type === 'success' && feedback.details && (
                                            <div className="text-xs opacity-90 font-medium space-y-0.5 mt-2">
                                                <p><span className="font-bold">Participante:</span> {feedback.details.participanteId ? `Utilizador #${feedback.details.participanteId}` : 'Convidado'}</p>
                                                <p><span className="font-bold">Lote:</span> {feedback.details.lote}</p>
                                                <p><span className="font-bold">Evento:</span> {feedback.details.evento}</p>
                                            </div>
                                        )}

                                        {feedback.type === 'warning' && feedback.details && (
                                            <div className="text-xs opacity-90 font-medium mt-1">
                                                <p><span className="font-bold">Entrada anterior:</span> {feedback.details.usedAt ? new Date(feedback.details.usedAt).toLocaleString('pt-PT') : 'Sem data'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Verification Form */}
                            <form onSubmit={handleValidate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Introduzir Token QR Code</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">qr_code</span>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Cole ou leia o token do bilhete..."
                                            value={qrCodeToken}
                                            onChange={(e) => setQrCodeToken(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono text-sm"
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Os leitores de código de barras USB/Bluetooth submetem automaticamente ao ler.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !qrCodeToken.trim()}
                                    className={`w-full py-3 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                                        loading || !qrCodeToken.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10'
                                    }`}
                                >
                                    {loading ? 'A validar...' : 'Validar Entrada'}
                                    <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                                </button>
                            </form>
                        </div>

                        {/* Split layout for History & Test Simulator */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Simulator for University Grading / Testing */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">science</span>
                                    Simulador de Bilhetes
                                </h3>
                                <p className="text-xs text-slate-500">Use estes bilhetes de teste para testar o fluxo de validação no browser:</p>

                                {loadingSubData ? (
                                    <p className="text-xs text-slate-400 animate-pulse">A carregar bilhetes para testes...</p>
                                ) : simulatedTickets.length === 0 ? (
                                    <p className="text-xs text-slate-400">Nenhum bilhete comprado para este evento ainda.</p>
                                ) : (
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                                        {simulatedTickets.map((t, idx) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex justify-between items-center text-xs">
                                                <div className="truncate pr-2">
                                                    <p className="font-bold text-slate-800 truncate">{t.participante || 'Participante'}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{t.lote} • <span className="font-mono">{t.token.slice(0, 10)}...</span></p>
                                                </div>
                                                <button
                                                    onClick={() => simulateScan(t.token)}
                                                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${
                                                        t.estado === 'USADO' 
                                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    }`}
                                                >
                                                    {t.estado === 'USADO' ? 'Simular Usado' : 'Simular QR'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Validation History */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-600">history</span>
                                    Validações Recentes
                                </h3>

                                {loadingSubData ? (
                                    <p className="text-xs text-slate-400 animate-pulse">A carregar histórico...</p>
                                ) : checkinHistory.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-400">
                                        <span className="material-symbols-outlined text-3xl opacity-30 mb-1">history</span>
                                        <p>Nenhuma entrada validada recentemente.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                                        {checkinHistory.map((c) => (
                                            <div key={c.id} className="border-b border-slate-100 pb-2 last:border-b-0 flex justify-between items-start text-xs">
                                                <div>
                                                    <p className="font-bold text-slate-800">{c.participante || 'Convidado'}</p>
                                                    <p className="text-[10px] text-slate-500">{c.lote} • <span className="font-mono">{c.token.slice(0, 8)}...</span></p>
                                                </div>
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">{c.data}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
