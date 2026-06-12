"use client";

import React from 'react';

interface EventoItem {
    id: number;
    titulo: string;
    dataInicio: string;
    localizacao: string;
    lotacaoMaxima: number;
    organizadorNome: string;
    totalLotes: number;
}

interface AdminEventsProps {
    eventos: EventoItem[];
}

export default function AdminEvents({ eventos }: AdminEventsProps) {
    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Eventos</h1>
                <p className="text-slate-500">Visualize todos os eventos registados na plataforma globalmente.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">ID</th>
                                <th className="p-4">Evento</th>
                                <th className="p-4">Organizador</th>
                                <th className="p-4">Data e Local</th>
                                <th className="p-4 text-center">Lotação</th>
                                <th className="p-4 text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {eventos.length > 0 ? eventos.map(evento => (
                                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 text-sm text-slate-500 font-mono">#{evento.id.toString().padStart(4, '0')}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-900 line-clamp-1">{evento.titulo}</p>
                                        <p className="text-xs text-slate-500">{evento.totalLotes} lotes de bilhetes</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-[16px]">person</span>
                                            <span className="text-sm font-medium text-slate-700">{evento.organizadorNome}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-slate-700">{evento.dataInicio}</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{evento.localizacao}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-sm font-bold text-slate-700">{evento.lotacaoMaxima}</span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button type="button" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                        <button type="button" className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-500">
                                        Nenhum evento registado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
