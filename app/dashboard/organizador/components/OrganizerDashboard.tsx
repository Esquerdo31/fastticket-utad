"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { solicitarAcessoPromotores } from '@/app/actions/organizador';
import type { OrganizerStats } from '@/app/actions/organizador';
import OrganizerStatsPanel from './OrganizerStatsPanel';

interface EventoStat {
    id: number;
    titulo: string;
    dataInicio: string;
    localizacao: string;
    lotacaoMaxima: number;
    bilhetesVendidos: number;
    receita: number;
}

interface OrganizerDashboardProps {
    userName: string;
    summary: {
        totalEventos: number;
        totalBilhetesVendidos: number;
        receitaTotal: number;
    };
    nextEvents: EventoStat[];
    organizerStats: OrganizerStats;
    pedidoPromotores: string;
    parcerias: any[];
    onTabChange: (tab: any) => void;
}

export default function OrganizerDashboard({ userName, summary, nextEvents, organizerStats, pedidoPromotores, parcerias = [], onTabChange }: OrganizerDashboardProps) {
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");
    const router = useRouter();

    const handleSolicitarAcesso = () => {
        setMsg("");
        startTransition(async () => {
            const res = await solicitarAcessoPromotores();
            if (res.success) {
                setMsg("Pedido enviado com sucesso!");
                router.refresh();
            } else {
                setMsg(res.message || "Erro ao processar o pedido.");
            }
        });
    };

    const pendingInvites = parcerias.filter(p => p.estado === 'PENDENTE');

    return (
        <>
            {/* Notification for Promoter Invitation */}
            {pendingInvites.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-transparent border border-violet-500/30 rounded-2xl flex items-start gap-4 shadow-sm animate-fadeIn">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-700 shrink-0">
                        <span className="material-symbols-outlined text-[24px]">handshake</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">Novo Convite de Afiliado / Parceria!</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                            Foste convidado para promover o evento <strong className="text-violet-700">{pendingInvites[0].eventoTitulo}</strong> e ganhar comissões por venda.
                            {pendingInvites.length > 1 && ` Tens mais ${pendingInvites.length - 1} convite(s) pendente(s).`}
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => onTabChange('promotor')}
                        className="bg-violet-700 hover:bg-violet-800 hover:shadow-lg hover:shadow-violet-800/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md shadow-violet-800/10 shrink-0 cursor-pointer"
                    >
                        Ver Convites
                    </button>
                </div>
            )}

            {/* Welcome Section */}
            <section className="mb-10">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-900 via-violet-800 to-violet-600 p-8 lg:p-12 text-white shadow-xl shadow-violet-900/10">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                    <div className="relative z-10">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-300 mb-2">Painel de Organizador</p>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">Bem-vindo(a), {userName.split(" ")[0]}.</h1>
                        <p className="text-lg opacity-90 max-w-xl leading-relaxed">
                            Acompanhe o desempenho dos seus eventos e gira as vendas de bilhetes em tempo real.
                        </p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] opacity-10 rotate-12 select-none">campaign</span>
                </div>
            </section>

            {/* Secção de Solicitação de Promotores */}
            <OrganizerStatsPanel stats={organizerStats} />

            {pedidoPromotores !== 'APROVADO' && (
                <section className="mb-10 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                            pedidoPromotores === 'PENDENTE' ? 'bg-amber-100 text-amber-700' :
                            pedidoPromotores === 'REJEITADO' ? 'bg-red-100 text-red-700' : 'bg-violet-100 text-violet-700'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">
                                {pedidoPromotores === 'PENDENTE' ? 'hourglass_empty' :
                                 pedidoPromotores === 'REJEITADO' ? 'cancel' : 'campaign'}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg">Sistema de Núcleos & Promotores</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-xl">
                                {pedidoPromotores === 'NADA' && "Aumente as vendas dos seus eventos permitindo que afiliados, núcleos de estudantes ou promotores partilhem links dedicados e ganhem comissões."}
                                {pedidoPromotores === 'PENDENTE' && "O seu pedido de ativação de promotores está a ser avaliado por um administrador. Receberá acesso assim que for aprovado."}
                                {pedidoPromotores === 'REJEITADO' && "Infelizmente, o seu pedido para gerir promotores foi recusado pelo administrador. Pode tentar solicitar acesso novamente."}
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 w-full md:w-auto text-center">
                        {pedidoPromotores === 'NADA' && (
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleSolicitarAcesso}
                                className="w-full md:w-auto bg-violet-700 hover:bg-violet-800 hover:shadow-lg hover:shadow-violet-700/25 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-violet-700/20 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isPending ? "A processar..." : "Solicitar Acesso"}
                            </button>
                        )}
                        {pedidoPromotores === 'PENDENTE' && (
                            <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-4 py-2.5 rounded-full uppercase tracking-wider animate-pulse">
                                Aguarda Aprovação
                            </span>
                        )}
                        {pedidoPromotores === 'REJEITADO' && (
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleSolicitarAcesso}
                                className="w-full md:w-auto bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-700/25 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-red-700/20 active:scale-95 transition-all text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isPending ? "A processar..." : "Solicitar Novamente"}
                            </button>
                        )}
                        {msg && <p className="text-xs text-violet-700 font-bold mt-2">{msg}</p>}
                    </div>
                </section>
            )}

            <div className="hidden">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700">
                        <span className="material-symbols-outlined text-3xl">event</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eventos Ativos</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.totalEventos}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <span className="material-symbols-outlined text-3xl">local_activity</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bilhetes Vendidos</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.totalBilhetesVendidos}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <span className="material-symbols-outlined text-3xl">payments</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita Total</p>
                        <p className="text-3xl font-extrabold text-slate-900">{summary.receitaTotal.toFixed(2)}€</p>
                    </div>
                </div>
            </div>

            {/* Next Events */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Próximos Eventos</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {nextEvents.length > 0 ? nextEvents.map((evento) => (
                        <Link href={`/evento/${evento.id}`} key={evento.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-violet-200 hover:-translate-y-0.5 transition-all group cursor-pointer">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-violet-100 text-violet-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        Brevemente
                                    </span>
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-violet-500 transition-colors text-[20px]">open_in_new</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-violet-700 transition-colors">{evento.titulo}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                    {evento.dataInicio}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Lotação</span>
                                        <span className="font-bold text-slate-900">{evento.bilhetesVendidos} / {evento.lotacaoMaxima}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-violet-600 rounded-full" 
                                            style={{ width: `${Math.min(100, (evento.bilhetesVendidos / evento.lotacaoMaxima) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                            <p className="text-slate-500 font-medium">Não tem eventos agendados.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
