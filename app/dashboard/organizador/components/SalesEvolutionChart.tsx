"use client";

import React from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type SalesEvolutionPoint = {
    date: string;
    label: string;
    receita: number;
    bilhetes: number;
};

interface SalesEvolutionChartProps {
    data: SalesEvolutionPoint[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    }).format(value);

export default function SalesEvolutionChart({ data }: SalesEvolutionChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                <div>
                    <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">monitoring</span>
                    <p className="text-sm font-bold text-slate-600">Ainda nao existem vendas pagas</p>
                    <p className="mt-1 text-xs text-slate-400">O grafico aparece assim que houver receita registada.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="salesRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={18}
                    />
                    <YAxis
                        tickFormatter={(value) => `${value}EUR`}
                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                    />
                    <Tooltip
                        cursor={{ stroke: "#059669", strokeWidth: 1, strokeDasharray: "4 4" }}
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;

                            const point = payload[0].payload as SalesEvolutionPoint;

                            return (
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-200/70">
                                    <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
                                    <p className="text-sm font-black text-emerald-700">{formatCurrency(point.receita)}</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">{point.bilhetes} bilhete(s) vendidos</p>
                                </div>
                            );
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="receita"
                        stroke="#059669"
                        strokeWidth={3}
                        fill="url(#salesRevenueGradient)"
                        activeDot={{ r: 6, strokeWidth: 3, stroke: "#ffffff", fill: "#047857" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
