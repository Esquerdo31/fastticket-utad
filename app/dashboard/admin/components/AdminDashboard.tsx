"use client";

import React, { useState } from 'react';
import { exportarRelatorioGlobal } from '@/app/actions/admin';

interface AdminDashboardProps {
    userName: string;
    summary: {
        totalUsers: number;
        totalEventos: number;
        totalPedidos: number;
        receitaTotal: number;
    };
    onTabChange: (tab: any) => void;
}

export default function AdminDashboard({ userName, summary, onTabChange }: AdminDashboardProps) {
    const [chartMode, setChartMode] = useState<'mensal' | 'anual'>('mensal');
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    const handleExportReport = async () => {
        setError('');
        setDownloading(true);
        try {
            const res = await exportarRelatorioGlobal();
            if (res.success && res.csvContent) {
                // Trigger client-side file download
                const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `fastticket_auditoria_global_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setError(res.message || 'Falha ao exportar relatório.');
            }
        } catch (e: any) {
            setError('Erro ao gerar documento de exportação.');
        }
        setDownloading(false);
    };

    // Responsive custom SVG charts matching the exact mockups
    const chartPoints = chartMode === 'mensal' 
        ? {
            path: "M 0 140 Q 60 120 120 150 T 240 100 T 360 80 T 480 40 T 600 10",
            fill: "M 0 140 Q 60 120 120 150 T 240 100 T 360 80 T 480 40 T 600 10 L 600 180 L 0 180 Z",
            labels: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL']
        }
        : {
            path: "M 0 150 Q 150 110 300 90 T 450 40 T 600 5",
            fill: "M 0 150 Q 150 110 300 90 T 450 40 T 600 5 L 600 180 L 0 180 Z",
            labels: ['2022', '2023', '2024', '2025', '2026']
        };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg">
                {/* Decorative background shape */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="relative z-10 space-y-2">
                    <h1 className="text-xl sm:text-3xl font-black tracking-tight">Visão Macro do Ecossistema</h1>
                    <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-xl">
                        Controlo administrativo global da rede de bilhética académica UTAD.
                    </p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative group hover:border-emerald-600 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                            <span className="material-symbols-outlined text-2xl">group</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                            +12%
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total de Utilizadores</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalUsers.toLocaleString('pt-PT')}</p>
                    </div>
                </div>

                {/* Active Events */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative group hover:border-emerald-600 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                            <span className="material-symbols-outlined text-2xl">calendar_month</span>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
                            Tempo Real
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Eventos Ativos</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalEventos}</p>
                    </div>
                </div>

                {/* Financial Volume */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative group hover:border-emerald-600 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                            <span className="material-symbols-outlined text-2xl">payments</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                            +8.4%
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume Financeiro Global</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">€{summary.receitaTotal.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                </div>

                {/* Payments Success Rate */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative group hover:border-emerald-600 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <div className="w-6 h-1 bg-emerald-500 rounded-full mt-2" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Taxa de Sucesso Pagamentos</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">99.4%</p>
                    </div>
                </div>
            </div>

            {/* Chart and Recent Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Financial Volume Chart */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="font-extrabold text-slate-900 text-base">Crescimento Volume Financeiro</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Performance consolidada da plataforma</p>
                        </div>
                        <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/60">
                            <button 
                                onClick={() => setChartMode('mensal')} 
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartMode === 'mensal' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Mensal
                            </button>
                            <button 
                                onClick={() => setChartMode('anual')} 
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartMode === 'anual' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Anual
                            </button>
                        </div>
                    </div>

                    {/* Custom SVG Line Chart */}
                    <div className="relative pt-4 w-full h-[220px]">
                        <svg className="w-full h-[180px] overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                            {/* Grids */}
                            <line x1="0" y1="45" x2="600" y2="45" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1="90" x2="600" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1="135" x2="600" y2="135" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                            
                            {/* Area under line */}
                            <path d={chartPoints.fill} fill="url(#chartGradient)" />

                            {/* Line path */}
                            <path d={chartPoints.path} fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
                            
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        {/* X Axis Labels */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider px-1 pt-2">
                            {chartPoints.labels.map(l => (
                                <span key={l}>{l}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                        <div>
                            <h2 className="font-extrabold text-slate-900 text-base">Atividades Recentes</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Logs em tempo real do sistema</p>
                        </div>

                        {/* Activity list */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl mt-0.5">
                                    <span className="material-symbols-outlined text-base">person_add</span>
                                </div>
                                <div className="space-y-0.5 flex-1 min-w-0">
                                    <h4 className="font-extrabold text-xs text-slate-900 truncate">Novo Utilizador Registado</h4>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate">Mestrado em Informática, Polo I</p>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Há 2 minutos</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl mt-0.5">
                                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                                </div>
                                <div className="space-y-0.5 flex-1 min-w-0">
                                    <h4 className="font-extrabold text-xs text-slate-900 truncate">Compra de Bilhete: Gala UTAD</h4>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate">Transação ID #82910 aprovada</p>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Há 15 minutos</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl mt-0.5">
                                    <span className="material-symbols-outlined text-base">security</span>
                                </div>
                                <div className="space-y-0.5 flex-1 min-w-0">
                                    <h4 className="font-extrabold text-xs text-slate-900 truncate">Alerta de Segurança</h4>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate">Tentativa de login falhada - IP 193.136.x.x</p>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Há 42 minutos</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl mt-0.5">
                                    <span className="material-symbols-outlined text-base">celebration</span>
                                </div>
                                <div className="space-y-0.5 flex-1 min-w-0">
                                    <h4 className="font-extrabold text-xs text-slate-900 truncate">Novo Evento Publicado</h4>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate">Conferência Agronomia 2026</p>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Há 1 hora</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => onTabChange('logs')}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl transition-all active:scale-[0.98]"
                    >
                        VER TODOS OS LOGS
                    </button>
                </div>
            </div>

            {/* Audit Report and System Health Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Reports Generation Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm md:col-span-2 flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-16 h-16 shrink-0 bg-slate-900 text-white rounded-2xl flex items-center justify-center relative overflow-hidden">
                            <span className="material-symbols-outlined text-3xl">analytics</span>
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
                        </div>
                        <div className="space-y-1">
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                                Acesso Rápido
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-base">Geração de Relatórios Financeiros</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Exporte auditorias detalhadas em formato CSV/Excel para a reitoria e departamentos administrativos da UTAD.
                            </p>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

                    <div className="flex flex-wrap gap-3">
                        <button
                            disabled={downloading}
                            onClick={handleExportReport}
                            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/10 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            {downloading ? 'A Exportar...' : 'Exportar Relatório Global'}
                        </button>
                        <button
                            onClick={() => onTabChange('logs')}
                            className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl active:scale-[0.98] transition-all flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[16px]">filter_list</span>
                            Filtros Avançados
                        </button>
                    </div>
                </div>

                {/* System Health Status */}
                <div className="bg-[#022c22] border border-emerald-950 rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between gap-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                    <div className="space-y-4 relative z-10">
                        <h3 className="font-extrabold text-sm tracking-wide">Saúde do Sistema</h3>
                        
                        <div className="space-y-2.5 text-xs font-bold text-slate-200">
                            <div className="flex justify-between items-center">
                                <span>API STATUS</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>BASE DE DADOS</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>GATEWAY DE PAGAMENTOS</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 relative z-10 border-t border-emerald-900/60 pt-4">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                            <span>Carga Atual do CPU</span>
                            <span>28%</span>
                        </div>
                        <div className="w-full h-1.5 bg-emerald-950/80 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '28%' }} />
                        </div>
                        <p className="text-[9px] text-emerald-300/80 font-bold mt-1.5">
                            Próxima manutenção agendada: 14 Abr, 03:00
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
