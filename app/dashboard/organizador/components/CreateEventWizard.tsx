"use client";
import React, { useState, useEffect, useTransition } from 'react';
import { createEvento, getEventoById, updateEvento } from '@/app/actions/evento';

interface Lote { 
    id?: number;
    nome: string; 
    descricao: string; 
    preco: number; 
    lotacaoTotal: number; 
    quantidadeDisponivel?: number;
    tipo?: string; 
    diasValidos?: string; 
    vendaInicio?: string;
    vendaFim?: string;
}
interface Props { userName: string; userId: number; onEventCreated: () => void; editEventId?: number; }

function getDiasEvento(start: string, end: string) {
    if (!start) return [];
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : startDate;
    const dias = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const limit = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    let safetyCounter = 0;
    while (current <= limit && safetyCounter < 30) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        dias.push(`${y}-${m}-${d}`);
        current.setDate(current.getDate() + 1);
        safetyCounter++;
    }
    return dias;
}

export default function CreateEventWizard({ userName, userId, onEventCreated, editEventId }: Props) {
    const isEditMode = !!editEventId;
    const [step, setStep] = useState(1);
    const [formato, setFormato] = useState<'presencial'|'online'>('presencial');
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('Conferência');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [descricao, setDescricao] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [lotes, setLotes] = useState<Lote[]>([{ nome: 'Geral', descricao: '', preco: 0, lotacaoTotal: 50, tipo: 'DIARIO', diasValidos: '', vendaInicio: '', vendaFim: '' }]);

    // Confirmação de Publicação
    const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(isEditMode);

    // Load existing event data in edit mode
    useEffect(() => {
        if (!editEventId) return;
        getEventoById(editEventId).then(res => {
            if (res.success && res.data) {
                setTitulo(res.data.titulo);
                setDescricao(res.data.descricao);
                setDataInicio(res.data.dataInicio);
                setDataFim(res.data.dataFim || '');
                setLocalizacao(res.data.localizacao);
                setCategoria(res.data.categoria || 'Conferência');
                setFormato(res.data.formato || 'presencial');
                setBannerUrl(res.data.bannerUrl || '');
                setThumbnailUrl(res.data.thumbnailUrl || '');
                setLotes(res.data.lotes.map((l: any) => ({ 
                    id: l.id,
                    nome: l.nome, 
                    descricao: l.descricao, 
                    preco: l.preco, 
                    lotacaoTotal: l.lotacaoTotal,
                    quantidadeDisponivel: l.quantidadeDisponivel,
                    tipo: (l as any).tipo || 'DIARIO',
                    diasValidos: (l as any).diasValidos || '',
                    vendaInicio: (l as any).vendaInicio || '',
                    vendaFim: (l as any).vendaFim || ''
                })));
            } else {
                setError(res.message || 'Erro ao carregar evento.');
            }
            setLoading(false);
        });
    }, [editEventId]);

    const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
    const nextLabel = step === 1 ? 'Próximo: Bilheteira' : step === 2 ? 'Próximo: Publicação' : (isEditMode ? 'Guardar Alterações' : 'Publicar Evento');
    const totalBilhetes = lotes.reduce((s, l) => s + l.lotacaoTotal, 0);

    const addLote = () => {
        const days = getDiasEvento(dataInicio, dataFim);
        setLotes([...lotes, { 
            nome: '', 
            descricao: '', 
            preco: 0, 
            lotacaoTotal: 10, 
            tipo: 'DIARIO', 
            diasValidos: days[0] || '' 
        }]);
    };
    const removeLote = (i: number) => { if (lotes.length > 1) setLotes(lotes.filter((_, idx) => idx !== i)); };
    const updateLote = (i: number, field: keyof Lote, value: string | number) => {
        const u = [...lotes]; (u[i] as any)[field] = value; setLotes(u);
    };

    const submitEvent = () => {
        startTransition(async () => {
            const payload = { 
                titulo, 
                descricao, 
                dataInicio, 
                dataFim, 
                localizacao, 
                organizadorId: userId, 
                lotes, 
                bannerUrl: bannerUrl || undefined, 
                thumbnailUrl: thumbnailUrl || undefined,
                formato,
                categoria,
                estado: isEditMode ? undefined : 'PUBLICADO'
            };
            const res = isEditMode
                ? await updateEvento(editEventId!, payload)
                : await createEvento(payload);
            if (res.success) {
                setShowPublishConfirmModal(false);
                onEventCreated();
            } else {
                setError(res.message || 'Erro ao guardar evento.');
                setShowPublishConfirmModal(false);
            }
        });
    };

    const goNext = () => {
        setError('');
        if (step === 1) {
            if (!titulo.trim()) { setError('O título do evento é obrigatório.'); return; }
            if (titulo.trim().length < 3) { setError('O título do evento deve ter pelo menos 3 caracteres.'); return; }
            if (!descricao.trim()) { setError('A descrição do evento é obrigatória.'); return; }
            if (descricao.trim().length < 10) { setError('A descrição do evento deve ter pelo menos 10 caracteres.'); return; }
            if (!dataInicio) { setError('A data de início é obrigatória.'); return; }
            if (!dataFim) { setError('A data de fim é obrigatória.'); return; }
            if (new Date(dataFim) <= new Date(dataInicio)) { setError('A data de fim deve ser posterior à data de início.'); return; }
            if (!localizacao.trim()) { setError('A localização é obrigatória.'); return; }
            if (localizacao.trim().length < 2) { setError('A localização do evento deve ter pelo menos 2 caracteres.'); return; }

            const days = getDiasEvento(dataInicio, dataFim);
            setLotes(prev => prev.map(l => {
                if (!l.diasValidos) {
                    return {
                        ...l,
                        tipo: l.tipo || 'DIARIO',
                        diasValidos: l.tipo === 'GERAL' ? days.join(',') : (days[0] || '')
                    };
                }
                return l;
            }));
            setStep(2);
        } else if (step === 2) {
            if (lotes.length === 0) { setError('É necessário pelo menos um lote de bilhetes.'); return; }
            if (lotes.some(l => !l.nome.trim())) { setError('Preencha o nome de todos os lotes de bilhetes.'); return; }
            if (lotes.some(l => l.lotacaoTotal < 1)) { setError('A quantidade de todos os lotes deve ser de pelo menos 1.'); return; }
            setStep(3);
        } else {
            if (!isEditMode) {
                setShowPublishConfirmModal(true);
            } else {
                submitEvent();
            }
        }
    };
    const goBack = () => { setStep(s => s - 1); setError(''); };

    const vis = (s: number) => step === s ? 'opacity-100 translate-x-0 relative' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none';

    const handleUpload = async (file: File, type: 'banner' | 'thumbnail') => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                if (type === 'banner') setBannerUrl(data.url);
                else setThumbnailUrl(data.url);
            } else {
                setError(data.message || 'Erro no upload.');
            }
        } catch {
            setError('Erro ao enviar ficheiro.');
        }
        setUploading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-700 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500 font-medium">A carregar evento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 gap-2 mb-8">
                <span>EVENT MANAGEMENT</span>
                <span className="text-slate-300">/</span>
                <span className="text-violet-700">{isEditMode ? 'Editar Evento' : 'Novo Evento'}</span>
            </div>

            <div className="max-w-5xl mx-auto pb-24">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-10 max-w-3xl mx-auto relative">
                    <div className="absolute top-5 left-0 w-full h-px bg-slate-200 -z-10" />
                    {[{n:1,l:'Detalhes'},{n:2,l:'Bilheteira'},{n:3,l:'Publicação'}].map(s=>(
                        <div key={s.n} className="flex flex-col items-center gap-2 bg-[#f8fafc] px-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s.n ? 'bg-violet-700 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>{step > s.n ? '✓' : s.n}</div>
                            <span className={`text-xs font-bold tracking-widest uppercase transition-colors ${step >= s.n ? 'text-violet-700' : 'text-slate-400'}`}>{s.l}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 relative overflow-hidden" style={{ minHeight: '500px' }}>

                        {/* STEP 1 – Detalhes */}
                        <div className={`transition-all duration-400 ease-in-out ${vis(1)}`}>
                            <div className="space-y-8">
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="material-symbols-outlined text-violet-700 bg-violet-50 p-1 rounded">info</span>
                                        <h2 className="text-xl font-bold text-slate-900">Informações Básicas</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Título do Evento</label>
                                            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Conferência Internacional de Inovação Digital" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm text-slate-800 placeholder:text-slate-400" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Categoria</label>
                                                <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm text-slate-800">
                                                    <option>Conferência</option><option>Festa Académica</option><option>Desporto</option><option>Workshop</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Formato</label>
                                                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                                                    <button type="button" onClick={() => setFormato('presencial')} className={`flex-1 py-2.5 font-bold text-sm rounded-lg transition-all cursor-pointer active:scale-95 ${formato === 'presencial' ? 'bg-white text-violet-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'}`}>Presencial</button>
                                                    <button type="button" onClick={() => setFormato('online')} className={`flex-1 py-2.5 font-bold text-sm rounded-lg transition-all cursor-pointer active:scale-95 ${formato === 'online' ? 'bg-white text-violet-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'}`}>Online</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Data e Hora de Início</label>
                                                <input type="datetime-local" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm text-slate-800" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Data e Hora de Fim</label>
                                                <input type="datetime-local" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm text-slate-800" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Descrição do Evento</label>
                                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                                <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-2">
                                                    <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer active:scale-95 transition-all"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                                                    <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer active:scale-95 transition-all"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                                                    <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer active:scale-95 transition-all"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                                                    <div className="w-px h-4 bg-slate-300 mx-1" />
                                                    <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded cursor-pointer active:scale-95 transition-all"><span className="material-symbols-outlined text-[18px]">link</span></button>
                                                </div>
                                                <textarea rows={6} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva os detalhes do seu evento aqui..." className="w-full p-4 focus:outline-none text-sm text-slate-800 resize-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="material-symbols-outlined text-violet-700">location_on</span>
                                        <h2 className="text-xl font-bold text-slate-900">Localização</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="relative">
                                            <input type="text" value={localizacao} onChange={e => setLocalizacao(e.target.value)} placeholder="Pesquisar endereço ou local (ex: Aula Magna UTAD)" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm text-slate-800 placeholder:text-slate-400" />
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                        </div>
                                        <div className="w-full h-64 rounded-xl overflow-hidden relative border border-slate-200 bg-slate-100">
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                style={{ border: 0 }} 
                                                loading="lazy" 
                                                allowFullScreen 
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(localizacao || 'UTAD, Vila Real')}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 2 – Bilheteira */}
                        <div className={`transition-all duration-400 ease-in-out ${vis(2)}`}>
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-violet-700 bg-violet-50 p-1 rounded">confirmation_number</span>
                                            <h2 className="text-xl font-bold text-slate-900">Lotes de Bilhetes</h2>
                                        </div>
                                        <button type="button" onClick={addLote} className="bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-800 hover:shadow-md hover:shadow-violet-700/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
                                            <span className="material-symbols-outlined text-[18px]">add</span>Adicionar Lote
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {lotes.map((lote, i) => {
                                            const vendidos = lote.id && lote.quantidadeDisponivel !== undefined ? lote.lotacaoTotal - lote.quantidadeDisponivel : 0;
                                            const hasSoldTickets = vendidos > 0;

                                            return (
                                                <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200 relative group">
                                                    {lotes.length > 1 && (
                                                        hasSoldTickets ? (
                                                            <div className="absolute top-3 right-3 p-1 bg-amber-50 rounded px-2.5 py-1 border border-amber-200 text-amber-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-sm select-none" title="Lote com bilhetes emitidos (não pode ser removido)">
                                                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                                                Ativo ({vendidos} vendidos)
                                                            </div>
                                                        ) : (
                                                            <button type="button" onClick={() => removeLote(i)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95">
                                                                <span className="material-symbols-outlined text-[20px]">close</span>
                                                            </button>
                                                        )
                                                    )}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Nome do Lote</label>
                                                            <input type="text" value={lote.nome} onChange={e => updateLote(i, 'nome', e.target.value)} disabled={hasSoldTickets} placeholder="Ex: Geral, VIP, Estudante" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Quantidade</label>
                                                            <input type="number" min={hasSoldTickets ? vendidos : 1} value={lote.lotacaoTotal} onChange={e => updateLote(i, 'lotacaoTotal', parseInt(e.target.value) || 0)} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm" />
                                                            {hasSoldTickets && (
                                                                <span className="text-[9px] text-amber-600 font-bold mt-1 block">Mínimo: {vendidos} (vendidos)</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Preço (€)</label>
                                                            <input type="number" min={0} step={0.01} value={lote.preco} onChange={e => updateLote(i, 'preco', parseFloat(e.target.value) || 0)} disabled={hasSoldTickets} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed" />
                                                            {hasSoldTickets && (
                                                                <span className="text-[9px] text-slate-400 font-medium mt-1 block">Bloqueado (bilhetes vendidos)</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Descrição (Opcional)</label>
                                                            <input type="text" value={lote.descricao} onChange={e => updateLote(i, 'descricao', e.target.value)} placeholder="Ex: Acesso geral ao evento" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tipo de Bilhete</label>
                                                            <select
                                                                value={lote.tipo || 'DIARIO'}
                                                                disabled={hasSoldTickets}
                                                                onChange={e => {
                                                                    const type = e.target.value;
                                                                    const days = getDiasEvento(dataInicio, dataFim);
                                                                    updateLote(i, 'tipo', type);
                                                                    updateLote(i, 'diasValidos', type === 'GERAL' ? days.join(',') : (days[0] || ''));
                                                                }}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                                            >
                                                                <option value="DIARIO">Bilhete Diário</option>
                                                                <option value="GERAL">Passe Geral (Todos os dias)</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Dia(s) Válido(s)</label>
                                                            {lote.tipo === 'GERAL' ? (
                                                                <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
                                                                    Todos os dias ({getDiasEvento(dataInicio, dataFim).length} dias)
                                                                </div>
                                                            ) : (
                                                                <select
                                                                    value={lote.diasValidos || ''}
                                                                    disabled={hasSoldTickets}
                                                                    onChange={e => updateLote(i, 'diasValidos', e.target.value)}
                                                                    className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                                                >
                                                                    {getDiasEvento(dataInicio, dataFim).map(day => {
                                                                    // Format using JS date or simple slice
                                                                    const dateObj = new Date(day + 'T00:00:00');
                                                                    const label = dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
                                                                    return (
                                                                        <option key={day} value={day}>
                                                                            {label}
                                                                        </option>
                                                                    );
                                                                })}
                                                                {getDiasEvento(dataInicio, dataFim).length === 0 && (
                                                                    <option value="">(Defina primeiro as datas do evento)</option>
                                                                )}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Início das Vendas (Opcional)</label>
                                                            <input type="datetime-local" value={lote.vendaInicio || ''} onChange={e => updateLote(i, 'vendaInicio', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Fim das Vendas (Opcional)</label>
                                                            <input type="datetime-local" value={lote.vendaFim || ''} onChange={e => updateLote(i, 'vendaFim', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-4">Resumo da Bilheteira</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-violet-50 rounded-xl p-4 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">Total Lotes</p>
                                            <p className="text-2xl font-extrabold text-violet-700">{lotes.length}</p>
                                        </div>
                                        <div className="bg-violet-50 rounded-xl p-4 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">Total Bilhetes</p>
                                            <p className="text-2xl font-extrabold text-violet-700">{totalBilhetes}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 3 – Publicação */}
                        <div className={`transition-all duration-400 ease-in-out ${vis(3)}`}>
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="material-symbols-outlined text-violet-700 bg-violet-50 p-1 rounded">preview</span>
                                        <h2 className="text-xl font-bold text-slate-900">Resumo do Evento</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-violet-900 via-violet-800 to-violet-600 rounded-xl p-8 text-white relative overflow-hidden">
                                            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[120px] opacity-10 rotate-12 select-none">celebration</span>
                                            <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-2">{categoria} · {formato === 'presencial' ? 'Presencial' : 'Online'}</p>
                                            <h3 className="text-3xl font-extrabold mb-4">{titulo || 'Sem título'}</h3>
                                            <div className="flex flex-wrap gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                    {dataInicio ? new Date(dataInicio).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                    {localizacao || '—'}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-700 mb-2">Descrição</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{descricao || 'Sem descrição.'}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-700 mb-3">Bilheteira ({lotes.length} lotes)</h4>
                                            <div className="space-y-2">
                                                {lotes.map((l, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                        <div>
                                                            <p className="font-bold text-slate-800">{l.nome}</p>
                                                            <p className="text-xs text-slate-500">{l.lotacaoTotal} bilhetes</p>
                                                        </div>
                                                        <p className="font-extrabold text-violet-700 text-lg">{l.preco > 0 ? `${l.preco.toFixed(2)}€` : 'Grátis'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8 relative">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-violet-700">image</span>
                                <h2 className="text-lg font-bold text-slate-900">Media Assets</h2>
                                {uploading && <span className="text-xs text-violet-500 animate-pulse">A enviar...</span>}
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Banner Principal (1200x600)</label>
                                    {bannerUrl ? (
                                        <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                                            <img src={bannerUrl} alt="Banner" className="w-full h-36 object-cover" />
                                            <button type="button" onClick={() => setBannerUrl('')} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600 cursor-pointer active:scale-95">
                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors hover:border-violet-700/50">
                                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'banner'); }} />
                                            <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">cloud_upload</span>
                                            <p className="text-xs font-bold text-slate-700">Arraste ou clique para carregar</p>
                                            <p className="text-[10px] text-slate-400 mt-1">JPG, PNG até 5MB</p>
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Thumbnail (1:1)</label>
                                    <div className="flex gap-4">
                                        {thumbnailUrl ? (
                                            <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 group">
                                                <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setThumbnailUrl('')} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600 cursor-pointer active:scale-95">
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-24 h-24 shrink-0 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors hover:border-violet-700/50">
                                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'thumbnail'); }} />
                                                <span className="material-symbols-outlined text-xl text-slate-400 mb-1">add_photo_alternate</span>
                                                <span className="text-[8px] font-bold text-slate-500 uppercase">Carregar 1:1</span>
                                            </label>
                                        )}
                                        <p className="text-xs text-slate-500 italic flex-1 self-center">Dica: Use imagens de alta resolução que representem o espírito do evento.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl p-6 relative overflow-hidden bg-violet-900 text-white shadow-sm border border-violet-800">
                            <div className="absolute inset-0 bg-gradient-to-t from-violet-950 to-transparent" />
                            <div className="relative z-10 pt-20">
                                <h3 className="font-bold text-xl mb-2">Impacto Académico</h3>
                                <p className="text-sm text-violet-200/90 leading-relaxed">Organize conferências que definem o futuro do conhecimento na UTAD.</p>
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="sticky top-8 bg-violet-950 rounded-2xl p-6 shadow-xl border border-violet-900 text-white">
                            <div className="mb-6">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Progresso: {progress}%</span>
                                <div className="w-full h-1.5 bg-violet-900/50 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-violet-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                            {error && <p className="text-red-300 text-xs mb-4 bg-red-900/30 p-2 rounded-lg">{error}</p>}
                            <button type="button" onClick={goNext} disabled={isPending} className="w-full bg-white text-violet-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-violet-50 hover:shadow-lg active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                {isPending ? 'A publicar...' : nextLabel}
                                <span className="material-symbols-outlined text-[20px]">{step === 3 ? 'check' : 'arrow_forward'}</span>
                            </button>
                            {step > 1 && (
                                <button type="button" onClick={goBack} className="w-full mt-3 text-sm font-medium text-violet-300 hover:text-white hover:bg-white/5 rounded-lg py-2 transition-all text-center flex items-center justify-center gap-1 cursor-pointer active:scale-95">
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>Voltar
                                </button>
                            )}
                            <button type="button" className="w-full mt-2 text-sm font-medium text-violet-300/60 hover:text-violet-300 hover:bg-white/5 rounded-lg py-2 transition-all text-center cursor-pointer active:scale-95">Salvar como Rascunho</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal de Confirmação de Publicação */}
            {showPublishConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800">
                        <div className="flex items-center gap-3 mb-4 text-violet-700">
                            <span className="material-symbols-outlined text-3xl">campaign</span>
                            <h3 className="text-xl font-bold">Publicar Evento</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Desejas mesmo publicar o evento? Ao fazê-lo, ele tornar-se-á <strong className="text-slate-900">Público</strong> e ficará imediatamente disponível para venda de bilhetes.
                        </p>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Escreva "Confirmar" para prosseguir</label>
                                <input 
                                    type="text" 
                                    value={confirmText} 
                                    onChange={e => setConfirmText(e.target.value)} 
                                    placeholder="Escreva 'Confirmar'" 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm font-semibold placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowPublishConfirmModal(false);
                                    setConfirmText('');
                                }} 
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={submitEvent} 
                                disabled={confirmText !== 'Confirmar' || isPending}
                                className="flex-1 bg-violet-700 hover:bg-violet-850 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-700/20 cursor-pointer"
                            >
                                {isPending ? 'A publicar...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
