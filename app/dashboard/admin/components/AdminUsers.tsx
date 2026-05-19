"use client";

import React, { useState, useTransition } from 'react';
import { alterarUserRole } from '@/app/actions/admin';

interface UserItem {
    id: number;
    nome: string;
    email: string;
    role: string;
    _count: {
        eventos: number;
        pedidos: number;
    };
}

interface AdminUsersProps {
    users: UserItem[];
    onRefresh: () => void;
}

export default function AdminUsers({ users, onRefresh }: AdminUsersProps) {
    const [filter, setFilter] = useState<string>('ALL');
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const filteredUsers = users.filter(user => filter === 'ALL' || user.role === filter);

    const handleRoleChange = (userId: number, newRole: 'PARTICIPANTE' | 'ORGANIZADOR' | 'STAFF' | 'ADMIN') => {
        setFeedback({ type: null, message: '' });
        startTransition(async () => {
            const res = await alterarUserRole(userId, newRole);
            if (res.success) {
                setFeedback({ type: 'success', message: res.message });
                onRefresh();
            } else {
                setFeedback({ type: 'error', message: res.message || 'Erro ao alterar cargo.' });
            }
        });
    };

    const roleStyles: Record<string, string> = {
        PARTICIPANTE: 'bg-slate-100 text-slate-700 border-slate-200',
        ORGANIZADOR: 'bg-violet-100 text-violet-800 border-violet-200',
        STAFF: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ADMIN: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Gestão de Utilizadores</h1>
                <p className="text-slate-500 text-sm">Visualize e altere as permissões de acesso de todos os utilizadores da plataforma.</p>
            </div>

            {feedback.type && (
                <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 mb-6 ${
                    feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    <span className="material-symbols-outlined">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
                    {feedback.message}
                </div>
            )}

            <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                    Todos <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full">{users.length}</span>
                </button>
                <button onClick={() => setFilter('PARTICIPANTE')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === 'PARTICIPANTE' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                    Participantes <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full">{users.filter(u => u.role === 'PARTICIPANTE').length}</span>
                </button>
                <button onClick={() => setFilter('ORGANIZADOR')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === 'ORGANIZADOR' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                    Organizadores <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full">{users.filter(u => u.role === 'ORGANIZADOR').length}</span>
                </button>
                <button onClick={() => setFilter('STAFF')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === 'STAFF' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                    Staff <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full">{users.filter(u => u.role === 'STAFF').length}</span>
                </button>
                <button onClick={() => setFilter('ADMIN')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filter === 'ADMIN' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                    Admins <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full">{users.filter(u => u.role === 'ADMIN').length}</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">ID</th>
                                <th className="p-4">Utilizador</th>
                                <th className="p-4">Cargo Atual</th>
                                <th className="p-4 text-center">Eventos (Org)</th>
                                <th className="p-4 text-center">Pedidos</th>
                                <th className="p-4 text-right pr-6">Alterar Permissão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 text-xs text-slate-400 font-mono">#{user.id.toString().padStart(4, '0')}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-950">{user.nome}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${roleStyles[user.role] || 'bg-slate-100'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-semibold text-slate-700">{user._count.eventos}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-semibold text-slate-700">{user._count.pedidos}</span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <select
                                            disabled={isPending}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
                                        >
                                            <option value="PARTICIPANTE">PARTICIPANTE</option>
                                            <option value="ORGANIZADOR">ORGANIZADOR</option>
                                            <option value="STAFF">STAFF</option>
                                            <option value="ADMIN">ADMIN (Super Admin)</option>
                                        </select>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-500">
                                        Nenhum utilizador encontrado.
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
