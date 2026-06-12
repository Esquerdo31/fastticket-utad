"use client";

import React, { useState, useTransition } from 'react';
import { responderConvitePromotor } from '@/app/actions/promotores';

interface PromotorItem {
    id: number;
    eventoId: number;
    eventoTitulo: string;
    eventoData: string;
    eventoLocal: string;
    eventoEstado: string;
    eventoLotacaoMaxima: number;
    eventoBilhetesVendidos: number;
    eventoReceitaTotal: number;
    linkSlug: string;
    comissaoValor: number | null;
    comissaoPercent: number | null;
    estado: string; // PENDENTE, ACEITE, REJEITADO
    bilhetesVendidos: number;
    receitaGerada: number;
    comissaoAcumulada: number;
}

interface PromotorContentProps {
    parcerias: PromotorItem[];
    onRefresh: () => void;
}

export default function PromotorContent({ parcerias, onRefresh }: PromotorContentProps) {
    const [isPending, startTransition] = useTransition();
    const [customSlugs, setCustomSlugs] = useState<Record<number, string>>({});
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const pendingInvites = parcerias.filter(p => p.estado === 'PENDENTE');
    const activePartnerships = parcerias.filter(p => p.estado === 'ACEITE');

    const handleInviteResponse = (promotorId: number, accept: boolean) => {
        setFeedback({ type: null, message: '' });
        const slug = customSlugs[promotorId] || undefined;
        
        startTransition(async () => {
            const res = await responderConvitePromotor(promotorId, accept, slug);
            if (res.success) {
                setFeedback({ type: 'success', message: res.message });
                onRefresh();
            } else {
                setFeedback({ type: 'error', message: res.message || 'Erro ao responder ao convite.' });
            }
        });
    };

    const handleCopyLink = (partnership: PromotorItem) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const referralLink = `${origin}/evento/${partnership.eventoId}?ref=${partnership.linkSlug}`;
        
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopiedId(partnership.id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    // Calculate overall stats
    const totalVendas = activePartnerships.reduce((acc, p) => acc + p.bilhetesVendidos, 0);
    const totalFaturado = activePartnerships.reduce((acc, p) => acc + p.receitaGerada, 0);
    const totalComissoes = activePartnerships.reduce((acc, p) => acc + p.comissaoAcumulada, 0);

    const stats = [
        { label: 'Total Bilhetes Vendidos', value: totalVendas, icon: 'confirmation_number', bg: 'bg-[#006837]/10', text: 'text-[#006837]' },
        { label: 'Receita Gerada (Total)', value: `${totalFaturado.toFixed(2)}€`, icon: 'payments', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { label: 'Minhas Comissões', value: `${totalComissoes.toFixed(2)}€`, icon: 'account_balance_wallet', bg: 'bg-violet-50', text: 'text-violet-600' },
    ];

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Parcerias e Promoção</h1>
                <p className="text-slate-500">Promova os seus eventos favoritos com o seu link de afiliado exclusivo e ganhe comissões por cada venda.</p>
            </div>

            {feedback.type && (
                <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 mb-6 ${
                    feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    <span className="material-symbols-outlined">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
                    {feedback.message}
                </div>
            )}

            {/* Overall stats */}
            {activePartnerships.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                                <span className={`material-symbols-outlined ${s.text} text-[24px]`}>{s.icon}</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Convites Pendentes */}
            {pendingInvites.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">mail</span>
                        Convites de Parceria Pendentes ({pendingInvites.length})
                    </h2>
                    <div className="space-y-4">
                        {pendingInvites.map(invite => (
                            <div key={invite.id} className="bg-gradient-to-r from-amber-50/50 to-white rounded-2xl border border-amber-200 p-6 shadow-sm">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                Convite Recebido
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">ID #{invite.id.toString().padStart(4, '0')}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-950 mb-1">{invite.eventoTitulo}</h3>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{invite.eventoData}</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{invite.eventoLocal}</span>
                                        </div>
                                        <div className="mt-4 p-3 bg-white/80 border border-amber-100 rounded-xl inline-flex flex-col gap-1">
                                            <p className="text-xs font-semibold text-slate-700">Comissão Oferecida:</p>
                                            <p className="text-sm font-black text-emerald-700">
                                                {invite.comissaoPercent ? `${invite.comissaoPercent}% do valor da venda` : `${invite.comissaoValor?.toFixed(2)}€ por bilhete vendido`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Inputs and Actions */}
                                    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                                        <div className="w-full sm:w-48 text-left">
                                            <label htmlFor={`custom-slug-${invite.id}`} className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Link Personalizado (Opcional)</label>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">/</span>
                                                <input 
                                                    id={`custom-slug-${invite.id}`}
                                                    type="text"
                                                    disabled={isPending}
                                                    placeholder={invite.linkSlug}
                                                    value={customSlugs[invite.id] || ''}
                                                    onChange={(e) => setCustomSlugs({ ...customSlugs, [invite.id]: e.target.value })}
                                                    className="w-full pl-5 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                disabled={isPending}
                                                onClick={() => handleInviteResponse(invite.id, true)}
                                                className="flex-1 sm:flex-initial bg-[#006837] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">check</span>Aceitar
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isPending}
                                                onClick={() => handleInviteResponse(invite.id, false)}
                                                className="flex-1 sm:flex-initial border border-slate-200 bg-white text-red-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">close</span>Recusar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Parcerias Ativas */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006837]">campaign</span>
                    Minhas Parcerias Ativas ({activePartnerships.length})
                </h2>

                {activePartnerships.length > 0 ? (
                    <div className="space-y-6">
                        {activePartnerships.map(partnership => {
                            const quotaVendas = partnership.eventoBilhetesVendidos > 0 
                                ? ((partnership.bilhetesVendidos / partnership.eventoBilhetesVendidos) * 100).toFixed(1)
                                : '0.0';
                            
                            const percentagemOcupacao = partnership.eventoLotacaoMaxima > 0
                                ? Math.round((partnership.eventoBilhetesVendidos / partnership.eventoLotacaoMaxima) * 100)
                                : 0;

                            return (
                                <div key={partnership.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Event and Link info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                    Link Ativo
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">Slug: /{partnership.linkSlug}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-950 mb-1">{partnership.eventoTitulo}</h3>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 mb-4">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{partnership.eventoData}</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{partnership.eventoLocal}</span>
                                            </div>

                                            {/* Referral Link Box */}
                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">O Seu Link de Afiliado</p>
                                                    <p className="text-xs font-mono font-bold text-slate-600 truncate">
                                                        {typeof window !== 'undefined' ? `${window.location.origin}/evento/${partnership.eventoId}?ref=${partnership.linkSlug}` : `/evento/${partnership.eventoId}?ref=${partnership.linkSlug}`}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyLink(partnership)}
                                                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#006837] text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-all active:scale-95"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {copiedId === partnership.id ? 'done' : 'content_copy'}
                                                    </span>
                                                    {copiedId === partnership.id ? 'Copiado!' : 'Copiar'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Performance and Stats */}
                                        <div className="w-full md:w-80 flex flex-col justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Minhas Estatísticas de Afiliado</h4>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-white p-2 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] text-slate-400 font-bold">Vendas</p>
                                                    <p className="text-base font-black text-slate-900 mt-1">{partnership.bilhetesVendidos}</p>
                                                </div>
                                                <div className="bg-white p-2 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] text-slate-400 font-bold">Receita</p>
                                                    <p className="text-sm font-black text-slate-900 mt-1 truncate">{partnership.receitaGerada.toFixed(1)}€</p>
                                                </div>
                                                <div className="bg-white p-2 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] text-slate-400 font-bold">Comissão</p>
                                                    <p className="text-sm font-black text-emerald-700 mt-1 truncate">{partnership.comissaoAcumulada.toFixed(1)}€</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 font-semibold px-1">
                                                <span>Taxa Comissão:</span>
                                                <span className="text-slate-800">
                                                    {partnership.comissaoPercent ? `${partnership.comissaoPercent}%` : `${partnership.comissaoValor?.toFixed(2)}€/bilhete`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Event-wide Analytics (Conseguirem ver as analíticas do evento) */}
                                    <div className="border-t border-slate-150 pt-4 mt-2">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px] text-violet-700">analytics</span>
                                            Analíticas Gerais do Evento (Privado)
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ocupação Geral</p>
                                                    <p className="text-base font-black text-slate-900 mt-1">
                                                        {partnership.eventoBilhetesVendidos} / {partnership.eventoLotacaoMaxima} bilhetes
                                                    </p>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                                        <span>Taxa de Ocupação</span>
                                                        <span>{percentagemOcupacao}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-violet-600 rounded-full" 
                                                            style={{ width: `${Math.min(100, percentagemOcupacao)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Receita Bruta Acumulada</p>
                                                <p className="text-lg font-black text-slate-900 mt-1">
                                                    {partnership.eventoReceitaTotal.toFixed(2)}€
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Faturação total do evento em todos os lotes e vendas.</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Impacto do Promotor</p>
                                                    <p className="text-lg font-black text-[#006837] mt-1">
                                                        {quotaVendas}%
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                                    Representa a percentagem das vendas totais que foram geradas através do seu link.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">campaign</span>
                        <p className="text-lg font-semibold text-slate-600 mb-2">Sem parcerias ativas</p>
                        <p className="text-sm text-slate-400">Quando for convidado por um organizador de eventos para ser parceiro, os convites aparecerão nesta página.</p>
                    </div>
                )}
            </div>
        </>
    );
}
