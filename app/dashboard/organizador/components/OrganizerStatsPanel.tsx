"use client";

import React from "react";
import type { OrganizerStats } from "@/app/actions/organizador";
import SalesEvolutionChart from "./SalesEvolutionChart";

interface OrganizerStatsPanelProps {
    stats: OrganizerStats;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);

function MetricCard({
    label,
    value,
    icon,
    tone,
}: {
    label: string;
    value: string;
    icon: string;
    tone: "emerald" | "blue" | "amber";
}) {
    const tones = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100",
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${tones[tone]}`}>
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                </div>
            </div>
        </div>
    );
}

export default function OrganizerStatsPanel({ stats }: OrganizerStatsPanelProps) {
    return (
        <section className="mb-10 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <MetricCard
                    label="Receita Total"
                    value={formatCurrency(stats.receitaTotal)}
                    icon="payments"
                    tone="emerald"
                />
                <MetricCard
                    label="Bilhetes Vendidos"
                    value={String(stats.bilhetesVendidos)}
                    icon="confirmation_number"
                    tone="blue"
                />
                <MetricCard
                    label="Taxa de Check-in"
                    value={`${stats.taxaCheckin}%`}
                    icon="fact_check"
                    tone="amber"
                />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900">Evolucao das Vendas</h2>
                        <p className="mt-1 text-sm text-slate-500">Receita paga agrupada por dia nos eventos deste organizador.</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <span className="material-symbols-outlined text-[14px]">timeline</span>
                        Tempo real
                    </span>
                </div>
                <SalesEvolutionChart data={stats.vendasPorDia} />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
                    <h2 className="text-lg font-black text-slate-900">Eventos Ativos</h2>
                    <p className="mt-1 text-xs font-medium text-slate-500">Ocupacao calculada com bilhetes pagos ou ja utilizados.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                <th className="px-6 py-4">Evento</th>
                                <th className="px-4 py-4">Estado</th>
                                <th className="px-4 py-4">Data</th>
                                <th className="px-4 py-4">Ocupacao</th>
                                <th className="px-6 py-4 text-right">Receita</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.eventosAtivos.length > 0 ? stats.eventosAtivos.map((evento) => (
                                <tr key={evento.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{evento.titulo}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {evento.bilhetesVendidos} / {evento.lotacaoTotal} bilhete(s)
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                                            {evento.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">{evento.dataInicio}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-emerald-600 transition-all"
                                                    style={{ width: `${Math.min(100, evento.ocupacaoPercent)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-slate-700">{evento.ocupacaoPercent}%</span>
                                        </div>
                                        <p className="mt-1 text-[11px] font-medium text-slate-400">{evento.bilhetesUsados} check-in(s)</p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-emerald-700">
                                        {formatCurrency(evento.receita)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                                        Ainda nao existem eventos ativos para analisar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
