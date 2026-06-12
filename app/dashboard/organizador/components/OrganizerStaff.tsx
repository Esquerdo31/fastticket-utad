"use client";

import React, { useState, useEffect } from 'react';
import { criarStaff, getStaffEquipa, removerStaff } from '../../../actions/organizador';

export default function OrganizerStaff({ eventos }: { eventos: any[] }) {
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [passwordField, setPasswordField] = useState('');
    const [eventoId, setEventoId] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        carregarStaff();
        if (eventos && eventos.length > 0) {
            setEventoId(eventos[0].id.toString());
        }
    }, [eventos]);

    const carregarStaff = async () => {
        setLoading(true);
        const res = await getStaffEquipa();
        if (res.success) {
            setStaffList(res.staffList || []);
        }
        setLoading(false);
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!nome || !email || !passwordField || !eventoId) {
            setErrorMsg('Por favor, preencha todos os campos.');
            return;
        }

        setSubmitting(true);
        const res = await criarStaff({
            nome,
            email,
            passwordField,
            eventoId: Number(eventoId)
        });

        if (res.success) {
            setSuccessMsg(res.message || 'Staff criado com sucesso!');
            setNome('');
            setEmail('');
            setPasswordField('');
            carregarStaff();
        } else {
            setErrorMsg(res.message || 'Erro ao criar staff.');
        }
        setSubmitting(false);
    };

    const handleRemoveStaff = async (staffId: number, evId: number) => {
        if (!confirm('Tem a certeza que deseja remover este membro do staff do evento?')) return;
        
        const res = await removerStaff(staffId, evId);
        if (res.success) {
            setSuccessMsg(res.message || 'Staff removido.');
            carregarStaff();
        } else {
            setErrorMsg(res.message || 'Erro ao remover staff.');
        }
    };

    return (
        <div className="space-y-8 font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Equipa Staff</h1>
                    <p className="text-sm text-slate-500 mt-1">Gira os membros da equipa que podem fazer check-in e validar bilhetes nos teus eventos.</p>
                </div>
            </div>

            {/* Alert Messages */}
            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-fadeIn">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    <p>{errorMsg}</p>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-fadeIn">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <p>{successMsg}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Col (Left) */}
                <div className="lg:col-span-5">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-violet-700">person_add</span>
                            Adicionar Novo Staff
                        </h2>

                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div>
                                <label htmlFor="staff-nome" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nome Completo</label>
                                <input
                                    id="staff-nome"
                                    type="text"
                                    placeholder="Ex: João Silva"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="staff-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email de Acesso</label>
                                <input
                                    id="staff-email"
                                    type="email"
                                    placeholder="Ex: joao.staff@fastticket.pt"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="staff-pass" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Palavra-passe Temporária</label>
                                <input
                                    id="staff-pass"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={passwordField}
                                    onChange={(e) => setPasswordField(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="staff-evento" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Associar ao Evento</label>
                                <select
                                    id="staff-evento"
                                    value={eventoId}
                                    onChange={(e) => setEventoId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 transition-all text-sm appearance-none"
                                >
                                    {eventos && eventos.length > 0 ? (
                                        eventos.map((ev) => (
                                            <option key={ev.id} value={ev.id}>{ev.titulo}</option>
                                        ))
                                    ) : (
                                        <option value="">Nenhum evento ativo</option>
                                    )}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !eventoId}
                                className={`w-full py-3 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 ${
                                    submitting || !eventoId ? 'bg-slate-300 cursor-not-allowed' : 'bg-violet-700 shadow-md shadow-violet-700/10 hover:bg-violet-800 hover:shadow-lg hover:shadow-violet-700/20 cursor-pointer'
                                }`}
                            >
                                {submitting ? 'A processar...' : 'Criar Conta Staff'}
                                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Col (Right) */}
                <div className="lg:col-span-7">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-violet-700">badge</span>
                                Staffs Ativos
                            </h2>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{staffList.length} total</span>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <p className="text-violet-700 font-semibold animate-pulse">A carregar equipa staff...</p>
                            </div>
                        ) : staffList.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">badge</span>
                                <p className="text-slate-500 font-medium">Nenhum membro do staff registado.</p>
                                <p className="text-slate-400 text-xs mt-1">Utiliza o formulário ao lado para criar a tua primeira conta de verificação.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                {staffList.map((st) => (
                                    <div key={`${st.id}-${st.eventoId}`} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-800 text-sm">{st.nome}</h4>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[14px]">mail</span>
                                                {st.email}
                                            </p>
                                            <div className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 rounded-lg px-2 py-1 mt-1 text-[11px] font-semibold">
                                                <span className="material-symbols-outlined text-[12px]">event</span>
                                                {st.eventoTitulo}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStaff(st.id, st.eventoId)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100 active:scale-95 cursor-pointer"
                                            title="Remover acesso ao evento"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
