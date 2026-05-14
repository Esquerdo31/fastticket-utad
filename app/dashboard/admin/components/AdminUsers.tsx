"use client";

import React, { useState } from 'react';

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
}

export default function AdminUsers({ users }: AdminUsersProps) {
    const [filter, setFilter] = useState<string>('ALL');

    const filteredUsers = users.filter(user => filter === 'ALL' || user.role === filter);

    const roleStyles: Record<string, string> = {
        PARTICIPANTE: 'bg-slate-100 text-slate-700 border-slate-200',
        ORGANIZADOR: 'bg-violet-100 text-violet-800 border-violet-200',
        STAFF: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Utilizadores</h1>
                <p className="text-slate-500">Visualize e gira todos os utilizadores registados na plataforma.</p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
                    Todos <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{users.length}</span>
                </button>
                <button onClick={() => setFilter('PARTICIPANTE')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'PARTICIPANTE' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
                    Participantes <span className="ml-2 text-xs bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-800">{users.filter(u => u.role === 'PARTICIPANTE').length}</span>
                </button>
                <button onClick={() => setFilter('ORGANIZADOR')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'ORGANIZADOR' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
                    Organizadores <span className="ml-2 text-xs bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-800">{users.filter(u => u.role === 'ORGANIZADOR').length}</span>
                </button>
                <button onClick={() => setFilter('STAFF')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'STAFF' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
                    Staff <span className="ml-2 text-xs bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-800">{users.filter(u => u.role === 'STAFF').length}</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-4 pl-6">ID</th>
                                <th className="p-4">Utilizador</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-center">Eventos (Org)</th>
                                <th className="p-4 text-center">Pedidos</th>
                                <th className="p-4 text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 text-sm text-slate-500 font-mono">#{user.id.toString().padStart(4, '0')}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-900">{user.nome}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${roleStyles[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-sm font-medium text-slate-700">{user._count.eventos}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-sm font-medium text-slate-700">{user._count.pedidos}</span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
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
