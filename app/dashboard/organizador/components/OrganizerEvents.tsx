"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { getEventStatus, getEventStatusLabel, getEventStatusColor } from '@/lib/eventStatus';
import { publicarEvento } from '@/app/actions/evento';
import { slugify } from '@/lib/slug';

interface EventoStat {
    id: number;
    titulo: string;
    dataInicio: string;
    dataInicioRaw: string;
    dataFimRaw?: string | null;
    estado: string;
    localizacao: string;
    lotacaoMaxima: number;
    bilhetesVendidos: number;
    receita: number;
    lotes?: any[];
}

interface OrganizerEventsProps {
    eventos: EventoStat[];
    onCreateEvent?: () => void;
    onEditEvent?: (eventoId: number) => void;
}

export default function OrganizerEvents({ eventos, onCreateEvent, onEditEvent }: OrganizerEventsProps) {
    const [activeFilterTab, setActiveFilterTab] = useState<'ativos' | 'terminados'>('ativos');
    const [isPublishing, setIsPublishing] = useState<number | null>(null);
    const [publishConfirmId, setPublishConfirmId] = useState<number | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const [feedbackModal, setFeedbackModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        success: boolean;
    } | null>(null);

    const handlePublish = (eventoId: number) => {
        setPublishConfirmId(eventoId);
        setConfirmText('');
    };

    const executePublish = async (eventoId: number) => {
        setIsPublishing(eventoId);
        try {
            const res = await publicarEvento(eventoId);
            if (res.success) {
                setFeedbackModal({
                    show: true,
                    title: "Sucesso",
                    message: res.message || "Evento publicado com sucesso!",
                    success: true
                });
            } else {
                setFeedbackModal({
                    show: true,
                    title: "Erro",
                    message: res.message || "Ocorreu um erro ao publicar o evento.",
                    success: false
                });
            }
        } catch (err: any) {
            setFeedbackModal({
                show: true,
                title: "Erro",
                message: `Erro: ${err.message}`,
                success: false
            });
        } finally {
            setIsPublishing(null);
        }
    };

    const activeCount = eventos.filter(e => {
        const status = getEventStatus({
            estado: e.estado,
            dataInicio: e.dataInicioRaw,
            dataFim: e.dataFimRaw,
            lotes: e.lotes
        });
        return status !== 'TERMINADO';
    }).length;

    const endedCount = eventos.filter(e => {
        const status = getEventStatus({
            estado: e.estado,
            dataInicio: e.dataInicioRaw,
            dataFim: e.dataFimRaw,
            lotes: e.lotes
        });
        return status === 'TERMINADO';
    }).length;

    const filtered = eventos.filter(e => {
        const status = getEventStatus({
            estado: e.estado,
            dataInicio: e.dataInicioRaw,
            dataFim: e.dataFimRaw,
            lotes: e.lotes
        });
        if (activeFilterTab === 'ativos') {
            return status !== 'TERMINADO';
        } else {
            return status === 'TERMINADO';
        }
    });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Meus Eventos</h1>
                    <p className="text-slate-500">Faça a gestão dos seus eventos criados e acompanhe a lotação.</p>
                </div>
                <button type="button" onClick={onCreateEvent} className="bg-violet-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-800 hover:shadow-xl hover:shadow-violet-700/25 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-700/20 cursor-pointer">
                    <span className="material-symbols-outlined">add_circle</span>
                    Criar Novo Evento
                </button>
            </div>

            {/* Tab Filters */}
            <div className="flex border-b border-slate-200 mb-6 gap-2">
                <button
                    type="button"
                    onClick={() => setActiveFilterTab('ativos')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                        activeFilterTab === 'ativos'
                            ? 'border-violet-700 text-violet-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Eventos Ativos ({activeCount})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveFilterTab('terminados')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                        activeFilterTab === 'terminados'
                            ? 'border-violet-700 text-violet-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Eventos Terminados ({endedCount})
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">Evento</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Local</th>
                                <th className="p-4">Lotação</th>
                                <th className="p-4 text-right">Receita</th>
                                <th className="p-4 text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length > 0 ? filtered.map(evento => {
                                const lotacaoPercent = (evento.bilhetesVendidos / evento.lotacaoMaxima) * 100;
                                let statusColor = 'bg-emerald-500';
                                if (lotacaoPercent > 90) statusColor = 'bg-red-500';
                                else if (lotacaoPercent > 70) statusColor = 'bg-amber-500';

                                return (
                                    <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <Link href={`/evento/${evento.id}-${slugify(evento.titulo)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                                                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 shrink-0">
                                                    <span className="material-symbols-outlined text-[20px]">campaign</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-bold text-violet-700 line-clamp-1 hover:underline">{evento.titulo}</p>
                                                        {(() => {
                                                            const status = getEventStatus({
                                                                estado: evento.estado,
                                                                dataInicio: evento.dataInicioRaw,
                                                                dataFim: evento.dataFimRaw,
                                                                lotes: evento.lotes
                                                            });
                                                            return (
                                                                <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${getEventStatusColor(status)}`}>
                                                                    {getEventStatusLabel(status)}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5">#{evento.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-slate-700">{evento.dataInicio}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                <span className="line-clamp-1">{evento.localizacao}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${statusColor}`} style={{ width: `${Math.min(100, lotacaoPercent)}%` }}></div>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">
                                                    {evento.bilhetesVendidos}/{evento.lotacaoMaxima}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <p className="text-sm font-extrabold text-slate-900">{evento.receita.toFixed(2)}€</p>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                {evento.estado === 'RASCUNHO' && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handlePublish(evento.id)} 
                                                        disabled={isPublishing === evento.id}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50" 
                                                        title="Publicar evento"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">publish</span>
                                                    </button>
                                                )}
                                                <Link href={`/evento/${evento.id}-${slugify(evento.titulo)}/editar`} className="p-2 text-violet-600 hover:bg-violet-50 hover:text-violet-800 rounded-lg transition-all active:scale-95 cursor-pointer" title="Editar evento">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-500">
                                        Nenhum evento criado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Confirmação de Publicação */}
            {publishConfirmId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800 text-left">
                        <div className="flex items-center gap-3 mb-4 text-violet-700">
                            <span className="material-symbols-outlined text-3xl font-normal">campaign</span>
                            <h3 className="text-xl font-bold">Publicar Evento</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Desejas mesmo publicar o evento? Ao fazê-lo, ele tornar-se-á <strong className="text-slate-900">Público</strong> e ficará imediatamente disponível para venda de bilhetes.
                        </p>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label htmlFor="confirm-publish-input" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Escreva "Confirmar" para prosseguir</label>
                                <input 
                                    id="confirm-publish-input"
                                    type="text" 
                                    value={confirmText} 
                                    onChange={e => setConfirmText(e.target.value)} 
                                    placeholder="Escreva 'Confirmar'" 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm font-semibold placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setPublishConfirmId(null);
                                    setConfirmText('');
                                }} 
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    const id = publishConfirmId;
                                    setPublishConfirmId(null);
                                    setConfirmText('');
                                    executePublish(id);
                                }} 
                                disabled={confirmText !== 'Confirmar' || isPublishing !== null}
                                className="flex-1 bg-violet-700 hover:bg-violet-800 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-700/20 cursor-pointer"
                            >
                                {isPublishing !== null ? 'A publicar...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Feedback (Sucesso/Erro) */}
            {feedbackModal && feedbackModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                            feedbackModal.success 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">
                                {feedbackModal.success ? 'check_circle' : 'error'}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feedbackModal.title}</h3>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            {feedbackModal.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                const isSuccess = feedbackModal.success;
                                setFeedbackModal(null);
                                if (isSuccess) {
                                    window.location.reload();
                                }
                            }}
                            className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md cursor-pointer ${
                                feedbackModal.success
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/10'
                            }`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
