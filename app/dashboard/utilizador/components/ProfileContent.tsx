"use client";

import React, { useState, useTransition } from 'react';
import { updateProfileData } from '@/app/actions/profile';

interface ProfileContentProps {
    user: {
        id: number;
        nome: string;
        email: string;
        role: string;
    };
    onLogout: () => void;
}

export default function ProfileContent({ user, onLogout }: ProfileContentProps) {
    const [formData, setFormData] = useState({
        fullName: user.nome,
        email: user.email,
        phone: '' // Campo visual, não guardado na BD por agora
    });

    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(false);
    const [pushNotif, setPushNotif] = useState(true);

    const [isPending, startTransition] = useTransition();
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaveMessage(null);
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateProfileData(user.id, {
                nome: formData.fullName,
                email: formData.email,
            });
            if (result.success) {
                setSaveMessage({ type: 'success', text: result.message || 'Perfil atualizado!' });
            } else {
                setSaveMessage({ type: 'error', text: result.message || 'Erro ao guardar.' });
            }
        });
    };

    const handleDiscard = () => {
        setFormData({
            fullName: user.nome,
            email: user.email,
            phone: ''
        });
        setSaveMessage(null);
    };

    const roleLabel = user.role === 'ORGANIZADOR' ? 'Organizador' : user.role === 'STAFF' ? 'Staff' : 'Participante';

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Definições de Perfil</h1>
                <p className="text-slate-500">Gerencie as suas informações pessoais, preferências de segurança e notificações.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Coluna da Esquerda (Perfil e Status) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Card de Perfil */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center text-center border border-slate-100">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full border-4 border-emerald-50 overflow-hidden bg-slate-100">
                                <img
                                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.nome)}&backgroundColor=e2e8f0`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#006837] text-white rounded-full border-2 border-white flex items-center justify-center hover:bg-emerald-800 transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-1">{user.nome}</h2>
                        <p className="text-sm text-slate-500 mb-6">{roleLabel} — {user.email}</p>

                        <div className="w-full border-t border-slate-100 pt-6">
                            <div className="flex items-center justify-center gap-2 text-[#006837] font-bold text-sm bg-emerald-50 py-2 px-4 rounded-lg w-fit mx-auto">
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                CONTA VERIFICADA
                            </div>
                        </div>
                    </div>

                    {/* Card de Estado Académico */}
                    <div className="bg-[#004d29] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12 select-none">school</span>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Estado Académico</h3>
                            <p className="text-emerald-100/90 text-sm mb-6 leading-relaxed">
                                O seu registo está ativo para o ano letivo 2025/2026.
                            </p>
                            <div>
                                <div className="w-full h-2 bg-emerald-900/50 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-white rounded-full w-[85%]"></div>
                                </div>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-200">85% do curso concluído</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna da Direita (Formulários e Definições) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Card de Dados Pessoais */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006837]"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-[#006837]">badge</span>
                            <h3 className="text-lg font-bold text-slate-900">Dados Pessoais</h3>
                        </div>

                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Email Académico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Telemóvel</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+351 9XX XXX XXX"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save message */}
                        {saveMessage && (
                            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">{saveMessage.type === 'success' ? 'check_circle' : 'error'}</span>
                                    {saveMessage.text}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                            <button onClick={handleDiscard} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                                Descartar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="px-6 py-2.5 bg-[#006837] text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'A guardar...' : 'Guardar Alterações'}
                            </button>
                        </div>
                    </div>

                    {/* Card de Preferências de Notificação */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-slate-800">notifications_active</span>
                            <h3 className="text-lg font-bold text-slate-900">Preferências de Notificação</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Toggle Email */}
                            <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#006837]">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Notificações por Email</h4>
                                        <p className="text-xs text-slate-500">Alertas de bilhetes e prazos académicos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEmailNotif(!emailNotif)}
                                    className={`w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${emailNotif ? 'bg-[#006837]' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${emailNotif ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Toggle SMS */}
                            <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <span className="material-symbols-outlined text-[20px]">chat</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Alertas via SMS</h4>
                                        <p className="text-xs text-slate-500">Avisos urgentes e validação 2FA</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSmsNotif(!smsNotif)}
                                    className={`w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${smsNotif ? 'bg-[#006837]' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${smsNotif ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Toggle Push */}
                            <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#006837]">
                                        <span className="material-symbols-outlined text-[20px]">smartphone</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Notificações Push</h4>
                                        <p className="text-xs text-slate-500">Mensagens diretas no portal mobile</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPushNotif(!pushNotif)}
                                    className={`w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${pushNotif ? 'bg-[#006837]' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${pushNotif ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação Final (Password e Logout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <span className="material-symbols-outlined text-[#006837] mb-3 block">lock_reset</span>
                            <h4 className="font-bold text-slate-900 mb-2">Alterar Password</h4>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Mantenha a sua conta segura atualizando a sua chave de acesso periodicamente.</p>
                            <button className="text-sm font-bold text-[#006837] hover:text-emerald-800 transition-colors flex items-center gap-1">
                                Atualizar agora <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <span className="material-symbols-outlined text-red-600 mb-3 block">logout</span>
                            <h4 className="font-bold text-slate-900 mb-2">Terminar Sessão</h4>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Sair de todos os dispositivos ativos e limpar cache de sessão atual.</p>
                            <button onClick={onLogout} className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
                                Terminar todas as sessões <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}
