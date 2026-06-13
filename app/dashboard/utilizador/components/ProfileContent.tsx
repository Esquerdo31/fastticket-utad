"use client";

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { updateProfileData, changePassword, checkUserHasPassword } from '@/app/actions/profile';

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

    const [isPending, startTransition] = useTransition();
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // States for change password modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isModalPending, startModalTransition] = useTransition();
    const [hasPassword, setHasPassword] = useState<boolean | null>(null);

    // Fetch password status on mount
    useEffect(() => {
        async function fetchPasswordStatus() {
            const res = await checkUserHasPassword(user.id);
            if (res.success) {
                setHasPassword(res.hasPassword);
            }
        }
        fetchPasswordStatus();
    }, [user.id]);

    // Profile photo state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [customAvatar, setCustomAvatar] = useState<string | null>(null);

    // Load saved avatar from localStorage on mount
    useEffect(() => {
        const savedAvatar = localStorage.getItem(`profileAvatar_${user.id}`);
        if (savedAvatar) {
            setCustomAvatar(savedAvatar);
        }
    }, [user.id]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setSaveMessage({ type: 'error', text: 'Formato inválido. Use JPG, PNG ou WebP.' });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setSaveMessage({ type: 'error', text: 'Ficheiro demasiado grande. Máximo 5MB.' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setCustomAvatar(dataUrl);
            localStorage.setItem(`profileAvatar_${user.id}`, dataUrl);
            // Dispatch custom event for same-tab listeners (storage event only fires cross-tab)
            window.dispatchEvent(new CustomEvent('avatarChanged', { detail: { userId: user.id, avatarUrl: dataUrl } }));
            setSaveMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
        };
        reader.readAsDataURL(file);

        // Reset input so the same file can be selected again
        e.target.value = '';
    };

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

    const handlePasswordChange = () => {
        if (newPassword !== confirmNewPassword) {
            setModalMessage({ type: 'error', text: 'As palavras-passes não coincidem.' });
            return;
        }

        if (newPassword.trim().length < 6) {
            setModalMessage({ type: 'error', text: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
            return;
        }

        setModalMessage(null);
        startModalTransition(async () => {
            const result = await changePassword(user.id, {
                currentPassword,
                newPassword
            });

            if (result.success) {
                setModalMessage({ type: 'success', text: result.message || 'Palavra-passe alterada!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setHasPassword(true);
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setModalMessage(null);
                }, 1500);
            } else {
                setModalMessage({ type: 'error', text: result.message || 'Erro ao alterar palavra-passe.' });
            }
        });
    };

    const isOrg = user.role === 'ORGANIZADOR';
    const roleLabel = isOrg ? 'Organizador' : user.role === 'STAFF' ? 'Staff' : 'Participante';

    // Theme values
    const primaryBg = isOrg ? 'bg-violet-700' : 'bg-[#006837]';
    const primaryText = isOrg ? 'text-violet-700' : 'text-[#006837]';
    const focusRing = isOrg ? 'focus:ring-violet-700/20 focus:border-violet-700' : 'focus:ring-[#006837]/20 focus:border-[#006837]';
    const hoverBgLight = isOrg ? 'hover:bg-violet-50 hover:text-violet-800' : 'hover:bg-emerald-50 hover:text-emerald-800';
    const badgeBg = isOrg ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-emerald-50 text-[#006837] border-emerald-100';
    const toggleBg = isOrg ? 'bg-violet-700' : 'bg-[#006837]';
    const buttonPrimary = isOrg ? 'bg-violet-700 hover:bg-violet-800 shadow-violet-700/20' : 'bg-[#006837] hover:bg-emerald-800 shadow-emerald-900/20';

    const avatarSrc = customAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.nome)}&backgroundColor=e2e8f0`;

    return (
        <>
            {/* Hidden file input for profile photo */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
            />

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
                            <div className="w-32 h-32 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-100">
                                <img
                                    src={avatarSrc}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button type="button" onClick={handleAvatarClick} className={`absolute bottom-1 right-1 w-8 h-8 ${primaryBg} text-white rounded-full border-2 border-white flex items-center justify-center hover:opacity-90 transition-colors cursor-pointer`}>
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-1">{user.nome}</h2>
                        <p className="text-sm text-slate-500 mb-6">{roleLabel} — {user.email}</p>

                        <div className="w-full border-t border-slate-100 pt-6">
                            <div className={`flex items-center justify-center gap-2 ${badgeBg} font-bold text-xs border py-2 px-4 rounded-lg w-fit mx-auto`}>
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                CONTA VERIFICADA
                            </div>
                        </div>
                    </div>

                    {/* Conditional Status Card based on Role */}
                    {isOrg && (
                        <div className="bg-violet-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12 select-none">verified_user</span>
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Status de Organização</h3>
                                <p className="text-violet-200/90 text-sm mb-6 leading-relaxed">
                                    A sua conta de organizador está verificada e ativa.
                                </p>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                                        <span className="text-xs font-bold text-white">Permissões de Criação</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                                        <span className="text-xs font-bold text-white">Acesso a Faturação</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Coluna da Direita (Formulários e Definições) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Card de Dados Pessoais */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${primaryBg}`}></div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className={`material-symbols-outlined ${primaryText}`}>badge</span>
                            <h3 className="text-lg font-bold text-slate-900">Dados Pessoais</h3>
                        </div>

                        <div className="space-y-5 mb-8">
                            <div>
                                <label htmlFor="profile-fullName" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Nome Completo</label>
                                <input
                                    id="profile-fullName"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 ${focusRing} transition-all`}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="profile-email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Email Académico</label>
                                    <input
                                        id="profile-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 ${focusRing} transition-all`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="profile-phone" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Telemóvel</label>
                                    <input
                                        id="profile-phone"
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+351 9XX XXX XXX"
                                        className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 ${focusRing} transition-all`}
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
                            <button type="button" onClick={handleDiscard} className="px-4 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer">
                                Descartar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isPending}
                                className={`px-6 py-2.5 ${buttonPrimary} text-white text-sm font-semibold rounded-lg hover:shadow-md active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                {isPending ? 'A guardar...' : 'Guardar Alterações'}
                            </button>
                        </div>
                    </div>

                    {/* Botões de Ação Final (Password e Logout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <span className={`material-symbols-outlined ${primaryText} mb-3 block`}>lock_reset</span>
                            <h4 className="font-bold text-slate-900 mb-2">Alterar Password</h4>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Mantenha a sua conta segura atualizando a sua chave de acesso periodicamente.</p>
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowPasswordModal(true);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmNewPassword('');
                                    setModalMessage(null);
                                }}
                                className={`text-sm font-bold ${primaryText} ${hoverBgLight} transition-all flex items-center gap-1 px-3 py-2 -ml-3 rounded-lg cursor-pointer`}
                            >
                                Atualizar agora <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <span className="material-symbols-outlined text-red-600 mb-3 block">logout</span>
                            <h4 className="font-bold text-slate-900 mb-2">Terminar Sessão</h4>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Sair de todos os dispositivos ativos e limpar cache de sessão atual.</p>
                            <button type="button" onClick={onLogout} className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all flex items-center gap-1 px-3 py-2 -ml-3 rounded-lg cursor-pointer">
                                Terminar todas as sessões <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
                            </button>
                        </div>

                    </div>

                </div>
            </div>

            {/* Modal Alterar Password */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800 text-left">
                        <div className={`flex items-center gap-3 mb-6 ${primaryText}`}>
                            <span className="material-symbols-outlined text-3xl">lock_reset</span>
                            <h3 className="text-xl font-bold">Alterar Password</h3>
                        </div>

                        <div className="space-y-4 mb-6">
                            {hasPassword !== false && user.role !== 'GUEST' && (
                                <div>
                                    <label htmlFor="profile-current-password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Password Atual</label>
                                    <input 
                                        id="profile-current-password"
                                        type="password" 
                                        value={currentPassword} 
                                        onChange={e => setCurrentPassword(e.target.value)} 
                                        placeholder="Palavra-passe atual" 
                                        className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${focusRing} text-sm font-semibold placeholder:text-slate-400`}
                                    />
                                </div>
                            )}
                            <div>
                                <label htmlFor="profile-new-password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Nova Password</label>
                                <input 
                                    id="profile-new-password"
                                    type="password" 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                    placeholder="Nova palavra-passe (mín. 6 caract.)" 
                                    className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${focusRing} text-sm font-semibold placeholder:text-slate-400`}
                                />
                            </div>
                            <div>
                                <label htmlFor="profile-confirm-new-password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Confirmar Nova Password</label>
                                <input 
                                    id="profile-confirm-new-password"
                                    type="password" 
                                    value={confirmNewPassword} 
                                    onChange={e => setConfirmNewPassword(e.target.value)} 
                                    placeholder="Confirmar nova palavra-passe" 
                                    className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${focusRing} text-sm font-semibold placeholder:text-slate-400`}
                                />
                            </div>
                        </div>

                        {modalMessage && (
                            <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                                modalMessage.type === 'success' 
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">
                                        {modalMessage.type === 'success' ? 'check_circle' : 'error'}
                                    </span>
                                    {modalMessage.text}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmNewPassword('');
                                    setModalMessage(null);
                                }} 
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handlePasswordChange}
                                disabled={isModalPending || !newPassword || !confirmNewPassword}
                                className={`flex-1 ${buttonPrimary} text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer`}
                            >
                                {isModalPending ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
