"use client";

import React, { useState, useTransition } from 'react';
import { aprovarEvento, rejeitarEvento, avaliarPedidoPromotores } from '@/app/actions/admin';

interface EventoItem {
    id: number;
    titulo: string;
    dataInicio: string;
    localizacao: string;
    lotacaoMaxima: number;
    organizadorNome: string;
    totalLotes: number;
    estado: string;
}

interface PromoterRequestItem {
    id: number;
    nome: string;
    email: string;
    pedidoPromotores: string;
}

interface AdminApprovalsProps {
    eventos: EventoItem[];
    promoterRequests: PromoterRequestItem[];
    onRefresh: () => void;
}

export default function AdminApprovals({ eventos, promoterRequests, onRefresh }: AdminApprovalsProps) {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    // Filter pending and large scale events
    const pendingEvents = eventos.filter(e => e.estado === 'PENDENTE');
    const publishedEvents = eventos.filter(e => e.estado === 'PUBLICADO');

    const handleAprovar = (id: number) => {
        setFeedback({ type: null, message: '' });
        startTransition(async () => {
            const res = await aprovarEvento(id);
            if (res.success) {
                setFeedback({ type: 'success', message: res.message });
                onRefresh();
            } else {
                setFeedback({ type: 'error', message: res.message || 'Erro ao aprovar evento.' });
            }
        });
    };

    const handleRejeitar = (id: number) => {
        setFeedback({ type: null, message: '' });
        startTransition(async () => {
            const res = await rejeitarEvento(id);
            if (res.success) {
                setFeedback({ type: 'success', message: res.message });
                onRefresh();
            } else {
                setFeedback({ type: 'error', message: res.message || 'Erro ao rejeitar evento.' });
            }
        });
    };

    const handleAprovarPromotor = (userId: number) => {
        setFeedback({ type: null, message: '' });
        startTransition(async () => {
            const res = await avaliarPedidoPromotores(userId, true);
            if (res.success) {
                setFeedback({ type: 'success', message: res.message });
                onRefresh();
            } else {
                setFeedback({ type: 'error', message: res.message || 'Erro ao aprovar pedido.' });
            }
        });
    };

    const handleRejeitarPromotor = (userId: number) => {
        setFeedback({ type: null, message: '' });
        startTransition(async () => {
            const res = await avaliarPedidoPromotores(userId, false);
            if (res.success) {
                setFeedback({ type: 'success', message: res.message });
                onRefresh();
            } else {
                setFeedback({ type: 'error', message: res.message || 'Erro ao rejeitar pedido.' });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Aprovações de Eventos</h1>
                <p className="text-slate-500 text-sm mt-1">Gira a aprovação de eventos de maior escala e o estado de publicação na UTAD.</p>
            </div>

            {feedback.type && (
                <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                    feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    <span className="material-symbols-outlined">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
                    {feedback.message}
                </div>
            )}

            {/* Pedidos de Acesso a Promotores */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                    <h2 className="font-extrabold text-slate-900">Aprovações de Acesso a Promotores ({promoterRequests.length})</h2>
                </div>

                {promoterRequests.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl opacity-30 mb-2">campaign</span>
                        <p className="text-sm font-medium">Não há pedidos de ativação de promotores pendentes de momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {promoterRequests.map(req => (
                            <div key={req.id} className="border border-slate-200 bg-slate-50 rounded-xl p-5 flex flex-col justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-extrabold text-slate-900">{req.nome}</h3>
                                        <span className="bg-violet-100 text-violet-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Acesso Promotor</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">mail</span>
                                        Email: {req.email}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Solicita permissão para associar promotores e gerir comissões de afiliados nos seus eventos.
                                    </p>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-slate-200/60">
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleRejeitarPromotor(req.id)}
                                        className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all rounded-lg active:scale-[0.98]"
                                    >
                                        Recusar
                                    </button>
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleAprovarPromotor(req.id)}
                                        className="flex-1 py-2 text-xs font-bold text-white bg-violet-700 hover:bg-violet-800 transition-all rounded-lg shadow-sm active:scale-[0.98] flex items-center justify-center gap-1"
                                    >
                                        Aprovar <span className="material-symbols-outlined text-xs">done</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pendentes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <h2 className="font-extrabold text-slate-900">Aprovações Pendentes ({pendingEvents.length})</h2>
                </div>

                {pendingEvents.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl opacity-30 mb-2">fact_check</span>
                        <p className="text-sm font-medium">Não há eventos de maior escala a aguardar aprovação de momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingEvents.map(ev => (
                            <div key={ev.id} className="border border-slate-200 bg-slate-50 rounded-xl p-5 flex flex-col justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-extrabold text-slate-900 line-clamp-2">{ev.titulo}</h3>
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Pendente</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        Organizador: {ev.organizadorNome}
                                    </p>
                                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {ev.localizacao}
                                    </p>
                                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                                        {ev.dataInicio}
                                    </p>
                                    <div className="flex gap-4 pt-2">
                                        <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-center flex-1">
                                            <p className="text-[9px] text-slate-400 uppercase font-bold">Lotação</p>
                                            <p className="text-xs font-black text-slate-700">{ev.lotacaoMaxima}</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-center flex-1">
                                            <p className="text-[9px] text-slate-400 uppercase font-bold">Lotes</p>
                                            <p className="text-xs font-black text-slate-700">{ev.totalLotes}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-slate-200/60">
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleRejeitar(ev.id)}
                                        className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all rounded-lg active:scale-[0.98]"
                                    >
                                        Recusar
                                    </button>
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleAprovar(ev.id)}
                                        className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all rounded-lg shadow-sm active:scale-[0.98] flex items-center justify-center gap-1"
                                    >
                                        Aprovar <span className="material-symbols-outlined text-xs">done</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ativos/Publicados */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h2 className="font-extrabold text-slate-900">Eventos Ativos ({publishedEvents.length})</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">ID</th>
                                <th className="p-4">Evento</th>
                                <th className="p-4">Organizador</th>
                                <th className="p-4">Data e Local</th>
                                <th className="p-4 text-center">Lotação</th>
                                <th className="p-4 text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {publishedEvents.length > 0 ? publishedEvents.map(ev => (
                                <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 font-mono text-slate-400">#{ev.id.toString().padStart(4, '0')}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-900 line-clamp-1">{ev.titulo}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{ev.totalLotes} lotes de bilhetes</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold text-slate-700">{ev.organizadorNome}</span>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-700">{ev.dataInicio}</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{ev.localizacao}</p>
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-700">{ev.lotacaoMaxima}</td>
                                    <td className="p-4 text-right pr-6">
                                        <button 
                                            disabled={isPending}
                                            onClick={() => handleRejeitar(ev.id)}
                                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 transition-colors text-xs font-bold rounded-lg"
                                            title="Suspender ou reverter para rascunho"
                                        >
                                            Suspender
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        Nenhum evento ativo registado.
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
