"use client";

import React, { useState, useEffect } from 'react';
import { getPromotoresPorEvento, adicionarPromotor } from '../../../actions/promotores';

export default function OrganizerPromoters({ eventos }: { eventos: any[] }) {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(eventos.length > 0 ? eventos[0].id : null);
    const [promotores, setPromotores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [slug, setSlug] = useState("");
    const [tipoComissao, setTipoComissao] = useState("PERCENTAGEM");
    const [valorComissao, setValorComissao] = useState(10);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (selectedEventId) {
            loadPromotores();
        }
    }, [selectedEventId]);

    const loadPromotores = async () => {
        if (!selectedEventId) return;
        setLoading(true);
        const res = await getPromotoresPorEvento(selectedEventId);
        if (res.success) {
            setPromotores(res.data || []);
        }
        setLoading(false);
    };

    const handleAddPromotor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) return;
        
        setMsg("A processar...");
        const cPercent = tipoComissao === "PERCENTAGEM" ? valorComissao : null;
        const cValor = tipoComissao === "FIXO" ? valorComissao : null;

        const res = await adicionarPromotor(selectedEventId, email, slug, cValor, cPercent);
        if (res.success) {
            setMsg("Sucesso!");
            setShowModal(false);
            setEmail("");
            setSlug("");
            loadPromotores();
        } else {
            setMsg(res.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Núcleos & Promotores</h1>
                    <p className="text-sm text-slate-500 mt-1">Gira os afiliados e parceiros de venda dos teus eventos.</p>
                </div>
                {eventos.length > 0 && (
                    <select
                        value={selectedEventId || ''}
                        onChange={(e) => setSelectedEventId(Number(e.target.value))}
                        className="p-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-violet-700 outline-none"
                    >
                        {eventos.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.titulo}</option>
                        ))}
                    </select>
                )}
            </div>

            {selectedEventId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-violet-700">leaderboard</span>
                            Leaderboard de Vendas
                        </h2>
                        <button 
                            onClick={() => { setMsg(""); setShowModal(true); }}
                            className="bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-violet-800 transition-colors shadow-md shadow-violet-700/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Adicionar Parceiro
                        </button>
                    </div>
                    
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                                    <th className="p-4 font-bold">Núcleo / Parceiro</th>
                                    <th className="p-4 font-bold">Link (Slug)</th>
                                    <th className="p-4 font-bold">Comissão</th>
                                    <th className="p-4 font-bold">Estado</th>
                                    <th className="p-4 font-bold text-center">Bilhetes Vendidos</th>
                                    <th className="p-4 font-bold text-right">A Pagar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">A carregar dados...</td></tr>
                                ) : promotores.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum parceiro associado a este evento.</td></tr>
                                ) : promotores.map((p, idx) => (
                                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{p.nome}</p>
                                                    <p className="text-[11px] text-slate-400">{p.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-600">?ref={p.linkSlug}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-semibold text-violet-700 bg-violet-50 px-2 py-1 rounded">
                                                {p.comissaoPercent ? `${p.comissaoPercent}%` : `€${p.comissaoValor}`}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {p.estado === 'ACEITE' && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                                    <span className="material-symbols-outlined text-[10px]">check_circle</span> Aceite
                                                </span>
                                            )}
                                            {p.estado === 'PENDENTE' && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider animate-pulse">
                                                    <span className="material-symbols-outlined text-[10px]">hourglass_empty</span> Pendente
                                                </span>
                                            )}
                                            {p.estado === 'REJEITADO' && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                                                    <span className="material-symbols-outlined text-[10px]">cancel</span> Recusado
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-xl font-black text-slate-800">{p.bilhetesVendidos}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-lg font-bold text-emerald-600">€{p.comissaoTotal.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 text-center rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-500">Crie um evento primeiro para associar parceiros.</p>
                </div>
            )}

            {/* Modal de Novo Parceiro */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Adicionar Parceiro/Núcleo</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddPromotor} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail da Conta (do Parceiro)</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-violet-700 bg-slate-50" placeholder="ex: nucleo@utad.pt" />
                                <p className="text-[10px] text-slate-400 mt-1">O parceiro já tem de ter criado uma conta na plataforma.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug do Link</label>
                                <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-violet-700 bg-slate-50 font-mono text-sm" placeholder="ex: nucleo-informatica" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Comissão</label>
                                    <select value={tipoComissao} onChange={e => setTipoComissao(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-violet-700 bg-slate-50">
                                        <option value="PERCENTAGEM">Percentagem (%)</option>
                                        <option value="FIXO">Valor Fixo (€)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor</label>
                                    <input type="number" step="0.01" required value={valorComissao} onChange={e => setValorComissao(Number(e.target.value))} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-violet-700 bg-slate-50" />
                                </div>
                            </div>

                            {msg && <p className="text-sm text-center font-bold text-violet-700 bg-violet-50 p-2 rounded">{msg}</p>}

                            <button type="submit" className="w-full bg-violet-700 text-white font-bold py-3 rounded-xl mt-4 hover:bg-violet-800 transition-colors shadow-lg shadow-violet-700/20">
                                Convidar Parceiro
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
