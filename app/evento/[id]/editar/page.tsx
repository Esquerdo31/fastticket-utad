"use client";
import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    getEventoById, 
    updateEvento, 
    deleteEvento, 
    getOrganizerEventsForTransfer, 
    reembolsarBilhetesEvento, 
    transferirBilhetesEvento 
} from '@/app/actions/evento';

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

type Tab = 'detalhes' | 'bilheteira' | 'media' | 'personalizacao' | 'config';
interface Lote { 
    id?: number; 
    tempId?: string;
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

export default function EditarEventoPage() {
    const params = useParams();
    const router = useRouter();
    const eventoId = Number(params.id);

    const [tab, setTab] = useState<Tab>('detalhes');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [formato, setFormato] = useState('presencial');
    const [categoria, setCategoria] = useState('Conferência');
    const [estado, setEstado] = useState('RASCUNHO');
    const [bannerUrl, setBannerUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [organizadorId, setOrganizadorId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState<'ok'|'err'>('ok');
    const [uploading, setUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mostrarBanner, setMostrarBanner] = useState(true);
    const [mostrarLogo, setMostrarLogo] = useState(true);
    const [ticketCorFundo, setTicketCorFundo] = useState('#ffffff');
    const [ticketCorTexto, setTicketCorTexto] = useState('#000000');
    const [ticketMensagem, setTicketMensagem] = useState('Apresente este bilhete impresso ou no telemóvel na entrada do recinto.');
    const [ticketBackgroundUrl, setTicketBackgroundUrl] = useState('');
    const [ticketTemplate, setTicketTemplate] = useState('classic');
    const [ticketLogoUrl, setTicketLogoUrl] = useState('');
    const [ticketGlow, setTicketGlow] = useState(false);

    // Confirmação de Publicação
    const [originalEstado, setOriginalEstado] = useState<string>('');
    const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    // Estados para Reembolso e Transferência
    const [transferEvents, setTransferEvents] = useState<any[]>([]);
    const [selectedDestEventId, setSelectedDestEventId] = useState<number | ''>('');
    const [selectedDestLoteId, setSelectedDestLoteId] = useState<number | ''>('');
    const [compensationMsg, setCompensationMsg] = useState('');
    const [compensationMsgType, setCompensationMsgType] = useState<'ok'|'err'>('ok');
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);
    const [showTransferConfirm, setShowTransferConfirm] = useState(false);

    useEffect(() => {
        if (!eventoId) return;
        getEventoById(eventoId).then(res => {
            if (res.success && res.data) {
                const d = res.data;
                setTitulo(d.titulo); setDescricao(d.descricao); setDataInicio(d.dataInicio);
                setDataFim(d.dataFim || ''); setLocalizacao(d.localizacao);
                setFormato(d.formato || 'presencial'); setCategoria(d.categoria || 'Conferência');
                setEstado(d.estado || 'RASCUNHO'); setOriginalEstado(d.estado || 'RASCUNHO'); setBannerUrl(d.bannerUrl || '');
                setThumbnailUrl(d.thumbnailUrl || ''); setOrganizadorId(d.organizadorId);
                setMostrarBanner(d.mostrarBanner ?? true); setMostrarLogo(d.mostrarLogo ?? true);
                setTicketCorFundo(d.ticketCorFundo || '#ffffff');
                setTicketCorTexto(d.ticketCorTexto || '#000000');
                setTicketMensagem(d.ticketMensagem || 'Apresente este bilhete impresso ou no telemóvel na entrada do recinto.');
                setTicketBackgroundUrl(d.ticketBackgroundUrl || '');
                setTicketTemplate((d as any).ticketTemplate || 'classic');
                setTicketLogoUrl((d as any).ticketLogoUrl || '');
                setTicketGlow((d as any).ticketGlow ?? false);
                setLotes(d.lotes.map((l: any) => ({
                    id: l.id,
                    tempId: l.id.toString(),
                    nome: l.nome,
                    descricao: l.descricao || '',
                    preco: l.preco,
                    lotacaoTotal: l.lotacaoTotal,
                    quantidadeDisponivel: l.quantidadeDisponivel,
                    tipo: l.tipo || 'DIARIO',
                    diasValidos: l.diasValidos || '',
                    vendaInicio: l.vendaInicio || '',
                    vendaFim: l.vendaFim || ''
                })));
            }
            setLoading(false);
        });
    }, [eventoId]);

    const soldTicketsCount = lotes.reduce((sum, l) => sum + (l.id && l.quantidadeDisponivel !== undefined ? l.lotacaoTotal - l.quantidadeDisponivel : 0), 0);

    // Carregar outros eventos para transferência
    useEffect(() => {
        if (tab === 'config' && soldTicketsCount > 0) {
            getOrganizerEventsForTransfer(eventoId).then(res => {
                if (res.success && res.data) {
                    setTransferEvents(res.data);
                }
            });
        }
    }, [tab, soldTicketsCount, eventoId]);

    const handleRefund = () => {
        startTransition(async () => {
            const res = await reembolsarBilhetesEvento(eventoId);
            if (res.success) {
                setCompensationMsg(res.message);
                setCompensationMsgType('ok');
                setShowRefundConfirm(false);
                // Atualizar dados locais
                getEventoById(eventoId).then(res2 => {
                    if (res2.success && res2.data) {
                        setEstado(res2.data.estado);
                        setOriginalEstado(res2.data.estado);
                        setLotes(res2.data.lotes.map((l: any) => ({
                            id: l.id,
                            tempId: l.id.toString(),
                            nome: l.nome,
                            descricao: l.descricao || '',
                            preco: l.preco,
                            lotacaoTotal: l.lotacaoTotal,
                            quantidadeDisponivel: l.quantidadeDisponivel,
                            tipo: l.tipo || 'DIARIO',
                            diasValidos: l.diasValidos || '',
                            vendaInicio: l.vendaInicio || '',
                            vendaFim: l.vendaFim || ''
                        })));
                    }
                });
            } else {
                setCompensationMsg(res.message || 'Erro ao processar reembolso.');
                setCompensationMsgType('err');
            }
        });
    };

    const handleTransfer = () => {
        if (!selectedDestLoteId) return;
        startTransition(async () => {
            const res = await transferirBilhetesEvento(eventoId, selectedDestLoteId as number);
            if (res.success) {
                setCompensationMsg(res.message);
                setCompensationMsgType('ok');
                setShowTransferConfirm(false);
                setSelectedDestEventId('');
                setSelectedDestLoteId('');
                // Atualizar dados locais
                getEventoById(eventoId).then(res2 => {
                    if (res2.success && res2.data) {
                        setEstado(res2.data.estado);
                        setOriginalEstado(res2.data.estado);
                        setLotes(res2.data.lotes.map((l: any) => ({
                            id: l.id,
                            nome: l.nome,
                            descricao: l.descricao || '',
                            preco: l.preco,
                            lotacaoTotal: l.lotacaoTotal,
                            quantidadeDisponivel: l.quantidadeDisponivel,
                            tipo: l.tipo || 'DIARIO',
                            diasValidos: l.diasValidos || '',
                            vendaInicio: l.vendaInicio || '',
                            vendaFim: l.vendaFim || ''
                        })));
                    }
                });
            } else {
                setCompensationMsg(res.message || 'Erro ao transferir bilhetes.');
                setCompensationMsgType('err');
            }
        });
    };

    const flash = (text: string, type: 'ok'|'err') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

    const handleSave = (bypassConfirm = false) => {
        if (!titulo.trim()) { flash('O título do evento é obrigatório.', 'err'); return; }
        if (titulo.trim().length < 3) { flash('O título deve ter pelo menos 3 caracteres.', 'err'); return; }
        if (!descricao.trim()) { flash('A descrição do evento é obrigatória.', 'err'); return; }
        if (descricao.trim().length < 10) { flash('A descrição deve ter pelo menos 10 caracteres.', 'err'); return; }
        if (!dataInicio) { flash('A data de início é obrigatória.', 'err'); return; }
        if (!dataFim) { flash('A data de fim é obrigatória.', 'err'); return; }
        if (new Date(dataFim) <= new Date(dataInicio)) { flash('A data de fim deve ser posterior à data de início.', 'err'); return; }
        if (!localizacao.trim()) { flash('A localização é obrigatória.', 'err'); return; }
        if (localizacao.trim().length < 2) { flash('A localização deve ter pelo menos 2 caracteres.', 'err'); return; }
        if (lotes.length === 0) { flash('É necessário pelo menos um lote de bilhetes.', 'err'); return; }
        if (lotes.some(l => !l.nome.trim())) { flash('Preencha o nome de todos os lotes de bilhetes.', 'err'); return; }
        if (lotes.some(l => l.lotacaoTotal < 1)) { flash('A quantidade de todos os lotes deve ser de pelo menos 1.', 'err'); return; }

        if (!bypassConfirm && originalEstado !== 'PUBLICADO' && estado === 'PUBLICADO') {
            setShowPublishConfirmModal(true);
            return;
        }
        startTransition(async () => {
            const res = await updateEvento(eventoId, { 
                titulo, 
                descricao, 
                dataInicio, 
                dataFim, 
                localizacao, 
                organizadorId, 
                lotes, 
                bannerUrl, 
                thumbnailUrl, 
                formato, 
                categoria, 
                estado, 
                mostrarBanner, 
                mostrarLogo,
                ticketCorFundo,
                ticketCorTexto,
                ticketMensagem,
                ticketBackgroundUrl,
                ticketTemplate,
                ticketLogoUrl,
                ticketGlow
            });
            if (res.success) {
                flash('Evento guardado com sucesso!', 'ok');
                setOriginalEstado(estado);
            }
            else flash(res.message || 'Erro ao guardar.', 'err');
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deleteEvento(eventoId);
            if (res.success) router.push('/dashboard/organizador');
            else flash(res.message || 'Erro ao apagar.', 'err');
        });
    };

    const handleUpload = async (file: File, type: 'banner'|'thumbnail'|'ticketBackground'|'ticketLogo') => {
        setUploading(true);
        const fd = new FormData(); fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) { 
            if (type === 'banner') setBannerUrl(data.url); 
            else if (type === 'thumbnail') setThumbnailUrl(data.url);
            else if (type === 'ticketBackground') setTicketBackgroundUrl(data.url);
            else if (type === 'ticketLogo') setTicketLogoUrl(data.url);
        }
        else flash(data.message || 'Erro no upload.', 'err');
        setUploading(false);
    };

    const addLote = () => setLotes([...lotes, { tempId: Math.random().toString(), nome: '', descricao: '', preco: 0, lotacaoTotal: 10, tipo: 'DIARIO', diasValidos: '', vendaInicio: '', vendaFim: '' }]);
    const removeLote = (i: number) => { if (lotes.length > 1) setLotes(lotes.filter((_, idx) => idx !== i)); };
    const updateLote = (i: number, f: keyof Lote, v: string|number) => { const u = [...lotes]; (u[i] as any)[f] = v; setLotes(u); };
    const totalBilhetes = lotes.reduce((s, l) => s + l.lotacaoTotal, 0);

    const tabs: { id: Tab; icon: string; label: string }[] = [
        { id: 'detalhes', icon: 'description', label: 'Detalhes' },
        { id: 'bilheteira', icon: 'confirmation_number', label: 'Bilheteira' },
        { id: 'media', icon: 'image', label: 'Media' },
        { id: 'personalizacao', icon: 'palette', label: 'Personalizar Bilhete' },
        { id: 'config', icon: 'settings', label: 'Configurações' },
    ];

    const estadoBadge: Record<string, string> = { RASCUNHO: 'bg-amber-100 text-amber-700', PUBLICADO: 'bg-emerald-100 text-emerald-700', CANCELADO: 'bg-red-100 text-red-700' };
    const inputCls = "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-700 text-sm text-slate-800";
    const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2";

    if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-700 rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/organizador" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><span className="material-symbols-outlined">arrow_back</span></Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold text-slate-900 truncate max-w-md">{titulo || 'Sem título'}</h1>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${estadoBadge[estado] || estadoBadge.RASCUNHO}`}>{estado}</span>
                            </div>
                            <p className="text-xs text-slate-400">ID #{eventoId} · Edição Avançada</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {msg && <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${msgType === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</span>}
                        <button type="button" onClick={() => handleSave(false)} disabled={isPending} className="bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-800 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">{isPending ? 'hourglass_top' : 'save'}</span>{isPending ? 'A guardar...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-8">
                {/* Sidebar Tabs */}
                <nav className="w-56 shrink-0 hidden lg:block">
                    <div className="sticky top-24 space-y-1">
                        {tabs.map(t => (
                            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm ${tab === t.id ? 'bg-violet-700 text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <span className="material-symbols-outlined text-[20px]">{t.icon}</span>{t.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Mobile Tabs */}
                <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2 w-full">
                    {tabs.map(t => (
                        <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.id ? 'bg-violet-700 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'}`}>
                            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>{t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">

                    {/* TAB: DETALHES */}
                    {tab === 'detalhes' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-violet-700">info</span>Informações Básicas</h2>
                                <div className="space-y-6">
                                    <div><label htmlFor="edit-event-title" className={labelCls}>Título do Evento</label><input id="edit-event-title" type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className={inputCls} placeholder="Nome do evento" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div><label htmlFor="edit-event-category" className={labelCls}>Categoria</label>
                                            <select id="edit-event-category" value={categoria} onChange={e => setCategoria(e.target.value)} className={inputCls}><option>Conferência</option><option>Festa Académica</option><option>Desporto</option><option>Workshop</option><option>Outro</option></select>
                                        </div>
                                        <div><label className={labelCls}>Formato</label>
                                            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                                                <button type="button" onClick={() => setFormato('presencial')} className={`flex-1 py-3 font-bold text-sm rounded-lg transition-all ${formato === 'presencial' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>Presencial</button>
                                                <button type="button" onClick={() => setFormato('online')} className={`flex-1 py-3 font-bold text-sm rounded-lg transition-all ${formato === 'online' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>Online</button>
                                            </div>
                                        </div>
                                        <div><label htmlFor="edit-event-location" className={labelCls}>Localização</label><input id="edit-event-location" type="text" value={localizacao} onChange={e => setLocalizacao(e.target.value)} className={inputCls} /></div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Mapa de Localização</label>
                                        <div className="w-full h-64 rounded-xl overflow-hidden relative border border-slate-200 bg-slate-100 mt-2">
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                style={{ border: 0 }} 
                                                loading="lazy" 
                                                allowFullScreen 
                                                title="Mapa de localização do evento"
                                                sandbox="allow-scripts allow-same-origin allow-popups"
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(localizacao || 'UTAD, Vila Real')}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label htmlFor="edit-event-start-date" className={labelCls}>Data e Hora de Início</label><input id="edit-event-start-date" type="datetime-local" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={inputCls} /></div>
                                        <div><label htmlFor="edit-event-end-date" className={labelCls}>Data e Hora de Fim</label><input id="edit-event-end-date" type="datetime-local" value={dataFim} onChange={e => setDataFim(e.target.value)} className={inputCls} /></div>
                                    </div>
                                    <div><label htmlFor="edit-event-description" className={labelCls}>Descrição Completa</label><textarea id="edit-event-description" rows={12} value={descricao} onChange={e => setDescricao(e.target.value)} className={`${inputCls} resize-y`} placeholder="Descreva o evento em detalhe..." /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: BILHETEIRA */}
                    {tab === 'bilheteira' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><span className="material-symbols-outlined text-violet-700">confirmation_number</span>Lotes de Bilhetes</h2>
                                    <button type="button" onClick={addLote} className="bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-800 active:scale-95 transition-all flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">add</span>Novo Lote</button>
                                </div>
                                <div className="space-y-4">
                                    {lotes.map((lote, i) => {
                                        const vendidos = lote.id && lote.quantidadeDisponivel !== undefined ? lote.lotacaoTotal - lote.quantidadeDisponivel : 0;
                                        const hasSoldTickets = vendidos > 0;

                                        return (
                                            <div key={lote.tempId || lote.id || i} className="bg-slate-50 rounded-xl p-6 border border-slate-200 relative group">
                                                {lotes.length > 1 && (
                                                    hasSoldTickets ? (
                                                        <div className="absolute top-3 right-3 p-1 bg-amber-50 rounded px-2.5 py-1 border border-amber-200 text-amber-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shadow-sm select-none" title="Lote com bilhetes emitidos (não pode ser removido)">
                                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                                            Ativo ({vendidos} vendidos)
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => removeLote(i)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                                    )
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label htmlFor={`edit-lote-nome-${i}`} className={labelCls}>Nome do Lote</label>
                                                        <input id={`edit-lote-nome-${i}`} type="text" value={lote.nome} onChange={e => updateLote(i, 'nome', e.target.value)} disabled={hasSoldTickets} className={inputCls + " disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"} placeholder="Ex: Geral, VIP" />
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`edit-lote-preco-${i}`} className={labelCls}>Preço (€)</label>
                                                        <input id={`edit-lote-preco-${i}`} type="number" min={0} step={0.01} value={lote.preco} onChange={e => updateLote(i, 'preco', parseFloat(e.target.value) || 0)} disabled={hasSoldTickets} className={inputCls + " disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"} />
                                                        {hasSoldTickets && (
                                                            <span className="text-[9px] text-slate-400 font-medium mt-1 block">Bloqueado (bilhetes vendidos)</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`edit-lote-qtd-${i}`} className={labelCls}>Quantidade</label>
                                                        <input id={`edit-lote-qtd-${i}`} type="number" min={hasSoldTickets ? vendidos : 1} value={lote.lotacaoTotal} onChange={e => updateLote(i, 'lotacaoTotal', parseInt(e.target.value) || 0)} className={inputCls} />
                                                        {hasSoldTickets && (
                                                            <span className="text-[9px] text-amber-600 font-bold mt-1 block">Mínimo: {vendidos} (vendidos)</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-4"><label htmlFor={`edit-lote-desc-${i}`} className={labelCls}>Descrição (Opcional)</label><input id={`edit-lote-desc-${i}`} type="text" value={lote.descricao} onChange={e => updateLote(i, 'descricao', e.target.value)} className={inputCls} placeholder="Descrição do lote" /></div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4">
                                                    <div>
                                                        <label className={labelCls}>Tipo de Bilhete</label>
                                                        <select
                                                            value={lote.tipo || 'DIARIO'}
                                                            disabled={hasSoldTickets}
                                                            onChange={e => {
                                                                const type = e.target.value;
                                                                const days = getDiasEvento(dataInicio, dataFim);
                                                                updateLote(i, 'tipo', type);
                                                                updateLote(i, 'diasValidos', type === 'GERAL' ? days.join(',') : (days[0] || ''));
                                                            }}
                                                            className={inputCls + " disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"}
                                                        >
                                                            <option value="DIARIO">Bilhete Diário</option>
                                                            <option value="GERAL">Passe Geral (Todos os dias)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Dia(s) Válido(s)</label>
                                                        {lote.tipo === 'GERAL' ? (
                                                            <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                                                                Todos os dias ({getDiasEvento(dataInicio, dataFim).length} dias)
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={lote.diasValidos || ''}
                                                                disabled={hasSoldTickets}
                                                                onChange={e => updateLote(i, 'diasValidos', e.target.value)}
                                                                className={inputCls + " disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"}
                                                            >
                                                                {getDiasEvento(dataInicio, dataFim).map(day => {
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
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4">
                                                    <div>
                                                        <label htmlFor={`edit-lote-venda-inicio-${i}`} className={labelCls}>Início das Vendas (Opcional)</label>
                                                        <input 
                                                            id={`edit-lote-venda-inicio-${i}`}
                                                            type="datetime-local" 
                                                            value={lote.vendaInicio || ''} 
                                                            onChange={e => updateLote(i, 'vendaInicio', e.target.value)} 
                                                            className={inputCls} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`edit-lote-venda-fim-${i}`} className={labelCls}>Fim das Vendas (Opcional)</label>
                                                        <input 
                                                            id={`edit-lote-venda-fim-${i}`}
                                                            type="datetime-local" 
                                                            value={lote.vendaFim || ''} 
                                                            onChange={e => updateLote(i, 'vendaFim', e.target.value)} 
                                                            className={inputCls} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center"><p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">Lotes</p><p className="text-3xl font-extrabold text-violet-700">{lotes.length}</p></div>
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center"><p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">Total Bilhetes</p><p className="text-3xl font-extrabold text-violet-700">{totalBilhetes}</p></div>
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center"><p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">Lotação Máx.</p><p className="text-3xl font-extrabold text-violet-700">{totalBilhetes}</p></div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MEDIA */}
                    {tab === 'media' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-violet-700">image</span>Banner Principal</h2>
                                <p className="text-sm text-slate-500 mb-6">Imagem de capa do evento. Recomendado: 1200x600px.</p>
                                {uploading && <p className="text-violet-600 text-sm animate-pulse mb-4">A enviar ficheiro...</p>}
                                {bannerUrl ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                                        <img src={bannerUrl} alt="Banner" className="w-full h-64 object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                            <button type="button" onClick={() => setBannerUrl('')} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">delete</span>Remover</button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors hover:border-violet-700/50">
                                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'banner'); }} />
                                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">cloud_upload</span>
                                        <p className="text-sm font-bold text-slate-700">Arraste ou clique para carregar</p>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG ou WebP até 5MB</p>
                                    </label>
                                )}
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                                <div><p className="font-bold text-slate-800 text-sm">Mostrar Banner na Página do Evento</p><p className="text-xs text-slate-500">Se desativado, a página usa o gradiente institucional.</p></div>
                                <button type="button" onClick={() => setMostrarBanner(!mostrarBanner)} className={`relative w-12 h-7 rounded-full transition-colors ${mostrarBanner ? 'bg-violet-700' : 'bg-slate-300'}`}><span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${mostrarBanner ? 'translate-x-5' : ''}`} /></button>
                            </div>
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-violet-700">photo_camera</span>Thumbnail</h2>
                                <p className="text-sm text-slate-500 mb-6">Imagem quadrada para cards e listagens. Recomendado: 600x600px.</p>
                                <div className="flex gap-6 items-start">
                                    {thumbnailUrl ? (
                                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-slate-200 group shrink-0">
                                            <img src={thumbnailUrl} alt="Thumb" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                <button type="button" onClick={() => setThumbnailUrl('')} className="bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="w-40 h-40 shrink-0 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors hover:border-violet-700/50">
                                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'thumbnail'); }} />
                                            <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">add_photo_alternate</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Carregar</span>
                                        </label>
                                    )}
                                    <div className="bg-violet-50 rounded-xl p-4 border border-violet-100 flex-1">
                                        <p className="text-xs text-violet-700 font-bold mb-1">💡 Dica</p>
                                        <p className="text-xs text-violet-600 leading-relaxed">Use imagens de alta resolução que representem o espírito do evento. Imagens apelativas aumentam a taxa de conversão.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                                <div><p className="font-bold text-slate-800 text-sm">Mostrar Logo/Thumbnail na Página do Evento</p><p className="text-xs text-slate-500">Se ativado, aparece junto ao título como identidade visual.</p></div>
                                <button type="button" onClick={() => setMostrarLogo(!mostrarLogo)} className={`relative w-12 h-7 rounded-full transition-colors ${mostrarLogo ? 'bg-violet-700' : 'bg-slate-300'}`}><span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${mostrarLogo ? 'translate-x-5' : ''}`} /></button>
                            </div>
                        </div>
                    )}

                    {/* TAB: PERSONALIZAR BILHETE */}
                    {tab === 'personalizacao' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-violet-700">palette</span>
                                    Design do Bilhete PDF & Digital
                                </h2>
                                <p className="text-sm text-slate-500 mb-6">
                                    Escolha um estilo visual e carregue designs personalizados para tornar os bilhetes do seu evento únicos.
                                </p>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        {/* Template selector */}
                                        <div>
                                            <label className={labelCls}>Estilo Visual / Template</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'classic', label: 'Clássico', desc: 'Picotado tradicional' },
                                                    { id: 'glassmorphism', label: 'Glassmorphism', desc: 'Vidro premium fosco' },
                                                    { id: 'neon', label: 'Cyberpunk Neon', desc: 'Fundo escuro e neon' },
                                                    { id: 'minimalist', label: 'Minimalista', desc: 'Limpo e tipográfico' }
                                                ].map(tmpl => (
                                                    <button
                                                        key={tmpl.id}
                                                        type="button"
                                                        onClick={() => setTicketTemplate(tmpl.id)}
                                                        className={`p-4 rounded-xl border text-left transition-all ${ticketTemplate === tmpl.id ? 'border-violet-700 bg-violet-50/50 ring-2 ring-violet-700/10' : 'border-slate-200 hover:border-slate-300'}`}
                                                    >
                                                        <p className="font-bold text-sm text-slate-800">{tmpl.label}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">{tmpl.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Background upload control */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className={labelCls + " !mb-0"}>Imagem de Fundo do Bilhete</label>
                                                {ticketBackgroundUrl && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setTicketBackgroundUrl('')}
                                                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span> Remover Fundo
                                                    </button>
                                                )}
                                            </div>
                                            {ticketBackgroundUrl ? (
                                                <div className="relative rounded-xl overflow-hidden border border-slate-200 group h-32">
                                                    <img src={ticketBackgroundUrl} alt="Fundo bilhete" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <label className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                            Alterar Imagem
                                                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'ticketBackground'); }} />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors hover:border-violet-700/50">
                                                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'ticketBackground'); }} />
                                                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">cloud_upload</span>
                                                    <p className="text-xs font-bold text-slate-700">Carregar Imagem de Fundo (Ex: Arte do Evento)</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG de alta resolução</p>
                                                </label>
                                            )}
                                        </div>

                                        {/* Logo upload control */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className={labelCls + " !mb-0"}>Logótipo do Recinto / Patrocinadores</label>
                                                {ticketLogoUrl && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setTicketLogoUrl('')}
                                                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span> Remover Logo
                                                    </button>
                                                )}
                                            </div>
                                            {ticketLogoUrl ? (
                                                <div className="relative rounded-xl overflow-hidden border border-slate-200 group h-20 bg-slate-50 flex items-center justify-center p-3">
                                                    <img src={ticketLogoUrl} alt="Logo bilhete" className="h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <label className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                            Alterar Logo
                                                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'ticketLogo'); }} />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors hover:border-violet-700/50">
                                                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'ticketLogo'); }} />
                                                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">add_photo_alternate</span>
                                                    <p className="text-xs font-bold text-slate-700">Carregar Logótipo Oficial (Opcional)</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">Ideal: Imagem horizontal sem fundo (PNG transparente)</p>
                                                </label>
                                            )}
                                        </div>

                                        {/* Cores picker */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelCls}>Cor Base do Bilhete</label>
                                                <div className="flex gap-2 items-center">
                                                    <input 
                                                        type="color" 
                                                        value={ticketCorFundo} 
                                                        onChange={e => setTicketCorFundo(e.target.value)} 
                                                        className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer animate-none"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={ticketCorFundo} 
                                                        onChange={e => setTicketCorFundo(e.target.value)} 
                                                        className={inputCls + " !p-2 text-center"} 
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Cor do Texto</label>
                                                <div className="flex gap-2 items-center">
                                                    <input 
                                                        type="color" 
                                                        value={ticketCorTexto} 
                                                        onChange={e => setTicketCorTexto(e.target.value)} 
                                                        className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer animate-none"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={ticketCorTexto} 
                                                        onChange={e => setTicketCorTexto(e.target.value)} 
                                                        className={inputCls + " !p-2 text-center"} 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Glow toggle */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                            <div>
                                                <p className="font-bold text-slate-800 text-xs">Efeito Neon Glow / Brilho Externo</p>
                                                <p className="text-[10px] text-slate-500">Adiciona uma aura de iluminação ao redor do bilhete.</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setTicketGlow(!ticketGlow)} 
                                                className={`relative w-12 h-7 rounded-full transition-colors ${ticketGlow ? 'bg-violet-700' : 'bg-slate-300'}`}
                                            >
                                                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${ticketGlow ? 'translate-x-5' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Mensagem custom */}
                                        <div>
                                            <label className={labelCls}>Rodapé / Instruções do Bilhete</label>
                                            <textarea 
                                                rows={2} 
                                                value={ticketMensagem} 
                                                onChange={e => setTicketMensagem(e.target.value)} 
                                                className={inputCls} 
                                                placeholder="Instruções para o check-in ou notas adicionais..."
                                            />
                                        </div>
                                    </div>

                                    {/* Preview do Bilhete Column */}
                                    <div className="flex flex-col items-center justify-start">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 w-full text-left">Pré-visualização do Bilhete</h3>
                                        
                                        {/* Background wrapper to simulate glassmorphic depth */}
                                        <div className="w-full flex justify-center p-8 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden min-h-[500px] items-center">
                                            {/* Colored ambient orbs for glassmorphism */}
                                            {ticketTemplate === 'glassmorphism' && (
                                                <>
                                                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-violet-600 rounded-full blur-[40px] opacity-40 animate-pulse" />
                                                    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-fuchsia-600 rounded-full blur-[40px] opacity-40 animate-pulse" />
                                                </>
                                            )}

                                            {/* Neon grids or glow orbs for Cyberpunk */}
                                            {ticketTemplate === 'neon' && (
                                                <div className="absolute inset-0 bg-slate-950 opacity-10" />
                                            )}

                                            <div 
                                                style={{ 
                                                    backgroundColor: (ticketTemplate === 'glassmorphism' || ticketTemplate === 'neon') ? undefined : (ticketBackgroundUrl ? undefined : ticketCorFundo),
                                                    color: (ticketTemplate === 'glassmorphism' || ticketTemplate === 'neon' || ticketBackgroundUrl) ? '#ffffff' : ticketCorTexto,
                                                    backgroundImage: ticketBackgroundUrl ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.85)), url(${ticketBackgroundUrl})` : undefined,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    borderColor: ticketTemplate === 'neon' ? (ticketCorFundo || '#8b5cf6') : undefined,
                                                }}
                                                className={`w-full max-w-xs rounded-2xl flex flex-col p-6 font-sans transition-all duration-300 relative border ${
                                                    ticketTemplate === 'glassmorphism' 
                                                        ? 'bg-white/10 backdrop-blur-md border-white/20 shadow-2xl shadow-black/50' 
                                                        : ticketTemplate === 'neon'
                                                            ? 'bg-slate-950/90 border-2 shadow-2xl shadow-violet-500/10'
                                                            : ticketTemplate === 'minimalist'
                                                                ? 'bg-white text-slate-900 border-slate-200 shadow-lg'
                                                                : 'border-slate-200/60 shadow-lg'
                                                } ${
                                                    ticketGlow ? 'shadow-[0_0_25px_rgba(139,92,246,0.5)]' : ''
                                                }`}
                                            >
                                                {/* Classic Cutout Circles */}
                                                {ticketTemplate === 'classic' && (
                                                    <>
                                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border-r border-slate-200/60 z-10" />
                                                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border-l border-slate-200/60 z-10" />
                                                    </>
                                                )}

                                                {/* Header & Logo */}
                                                <div className={`pb-4 flex flex-col items-center border-b ${
                                                    ticketTemplate === 'glassmorphism' 
                                                        ? 'border-white/10' 
                                                        : ticketTemplate === 'neon' 
                                                            ? 'border-violet-500/20' 
                                                            : ticketTemplate === 'minimalist'
                                                                ? 'border-slate-100'
                                                                : 'border-dashed border-slate-300/80'
                                                }`}>
                                                    {ticketLogoUrl ? (
                                                        <img src={ticketLogoUrl} alt="Logo" className="h-10 object-contain mb-2 max-w-full" />
                                                    ) : (
                                                        <div className={`text-[10px] uppercase font-black tracking-[0.25em] ${
                                                            ticketTemplate === 'neon' ? 'text-violet-400' : 'opacity-60'
                                                        }`}>FASTTICKET</div>
                                                    )}
                                                    <h4 className={`text-md font-bold truncate mt-1 text-center max-w-full ${
                                                        ticketTemplate === 'neon' ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-extrabold' : ''
                                                    }`}>
                                                        {titulo || "Título do Evento"}
                                                    </h4>
                                                    <p className="text-[10px] opacity-75 mt-0.5 truncate text-center max-w-full">{localizacao || "Localização"}</p>
                                                </div>
                                                
                                                {/* Participant & QR Code */}
                                                <div className="flex flex-col items-center my-6 space-y-4">
                                                    <div className="text-center">
                                                        <p className="text-[9px] uppercase tracking-widest opacity-60">Participante</p>
                                                        <p className="text-sm font-bold tracking-wide uppercase mt-0.5">PARTICIPANTE EXEMPLO</p>
                                                    </div>

                                                    <div className={`w-36 h-36 bg-white rounded-2xl p-3 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                                                        ticketTemplate === 'neon' ? 'border-2 border-violet-500/50' : 'border border-slate-100'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-[90px] text-slate-900 select-none">qr_code_2</span>
                                                    </div>
                                                    
                                                    <div className={`text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm font-mono tracking-widest ${
                                                        ticketTemplate === 'neon' ? 'bg-violet-950 text-violet-300 border border-violet-500/30' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        12345678
                                                    </div>
                                                </div>

                                                {/* Ticket Footer / Message */}
                                                <div className={`border-t pt-4 mt-auto text-center ${
                                                    ticketTemplate === 'glassmorphism' 
                                                        ? 'border-white/10' 
                                                        : ticketTemplate === 'neon' 
                                                            ? 'border-violet-500/20' 
                                                            : ticketTemplate === 'minimalist'
                                                                ? 'border-slate-100'
                                                                : 'border-dashed border-slate-300/80'
                                                }`}>
                                                    <p className="text-[9px] uppercase tracking-widest opacity-60 mb-1">Lote: Geral / Único</p>
                                                    <p className="text-[9px] leading-relaxed opacity-70 max-h-16 overflow-y-auto px-1">
                                                        {ticketMensagem || "Apresente este bilhete impresso ou no telemóvel na entrada do recinto."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: CONFIGURAÇÕES */}
                    {tab === 'config' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-violet-700">visibility</span>Estado do Evento</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(['RASCUNHO', 'PUBLICADO', 'CANCELADO'] as const).map(e => (
                                        <button key={e} type="button" onClick={() => setEstado(e)} className={`p-5 rounded-xl border-2 transition-all text-left ${estado === e ? 'border-violet-700 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest mb-2 ${estadoBadge[e]}`}>{e}</span>
                                            <p className="text-xs text-slate-500">{e === 'RASCUNHO' ? 'Evento visível apenas para si. Pode editar livremente.' : e === 'PUBLICADO' ? 'Evento visível publicamente. Bilhetes à venda.' : 'Evento cancelado. Não aceita mais compras.'}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {soldTicketsCount > 0 && (
                                <div className="bg-violet-50 rounded-2xl p-8 border border-violet-200">
                                    <h2 className="text-xl font-bold text-violet-900 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined">payments</span>
                                        Cancelamento & Compensação de Participantes
                                    </h2>
                                    <p className="text-sm text-slate-600 mb-6">
                                        Este evento já tem <strong className="text-violet-700">{soldTicketsCount} bilhete(s) vendido(s)</strong>. 
                                        Como tal, a eliminação direta está bloqueada. Pode cancelar o evento escolhendo uma das opções de compensação abaixo:
                                    </p>

                                    {compensationMsg && (
                                        <div className={`mb-6 p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                                            compensationMsgType === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                                        }`}>
                                            <span className="material-symbols-outlined">{compensationMsgType === 'ok' ? 'check_circle' : 'error'}</span>
                                            {compensationMsg}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Opção Reembolso */}
                                        <div className="bg-white p-6 rounded-xl border border-violet-100 flex flex-col justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-1">Opção A</span>
                                                <h3 className="text-base font-bold text-slate-800 mb-2">Reembolso Completo (Simulado)</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                                    Cancela o evento, marca todas as compras associadas como "Canceladas" e apaga os bilhetes emitidos. 
                                                    Isto libertará a base de dados permitindo-lhe apagar o evento permanentemente se desejar.
                                                </p>
                                            </div>
                                            <div>
                                                {!showRefundConfirm ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRefundConfirm(true)}
                                                        className="w-full bg-violet-700 hover:bg-violet-800 text-white py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">assignment_return</span>
                                                        Reembolsar e Cancelar
                                                    </button>
                                                ) : (
                                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                                        <p className="text-xs font-bold text-amber-800 mb-3 text-center">Tem a certeza? Esta ação cancela todas as compras e apaga os bilhetes.</p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowRefundConfirm(false)}
                                                                className="flex-1 bg-white hover:bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-xs border border-slate-200 transition-colors"
                                                            >
                                                                Voltar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleRefund}
                                                                disabled={isPending}
                                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-xs transition-colors"
                                                            >
                                                                {isPending ? 'A processar...' : 'Sim, Reembolsar'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Opção Transferência */}
                                        <div className="bg-white p-6 rounded-xl border border-violet-100 flex flex-col justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-1">Opção B</span>
                                                <h3 className="text-base font-bold text-slate-800 mb-2">Transferir para Outro Evento</h3>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                                    Transfere todos os {soldTicketsCount} bilhetes deste evento para um lote correspondente de outro evento ativo seu.
                                                </p>

                                                <div className="space-y-3 mb-6">
                                                    <div>
                                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Evento de Destino</label>
                                                        <select
                                                            value={selectedDestEventId}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                setSelectedDestEventId(val);
                                                                setSelectedDestLoteId('');
                                                            }}
                                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-violet-700"
                                                        >
                                                            <option value="">Escolher evento...</option>
                                                            {transferEvents.map(ev => (
                                                                <option key={ev.id} value={ev.id}>{ev.titulo}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {selectedDestEventId && (
                                                        <div>
                                                            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Lote de Destino</label>
                                                            <select
                                                                value={selectedDestLoteId}
                                                                onChange={(e) => setSelectedDestLoteId(Number(e.target.value))}
                                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-violet-700"
                                                            >
                                                                <option value="">Escolher lote...</option>
                                                                {transferEvents
                                                                    .find(ev => ev.id === selectedDestEventId)
                                                                    ?.lotes.map((l: any) => (
                                                                        <option key={l.id} value={l.id} disabled={l.quantidadeDisponivel < soldTicketsCount}>
                                                                            {l.nome} ({l.preco}€) · {l.quantidadeDisponivel} vagas disponíveis {l.quantidadeDisponivel < soldTicketsCount ? '(Insuficiente)' : ''}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                {!showTransferConfirm ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!selectedDestLoteId) return;
                                                            setShowTransferConfirm(true);
                                                        }}
                                                        disabled={!selectedDestLoteId}
                                                        className="w-full bg-violet-700 hover:bg-violet-800 text-white py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">move_down</span>
                                                        Transferir Bilhetes
                                                    </button>
                                                ) : (
                                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                                        <p className="text-xs font-bold text-amber-800 mb-3 text-center">Tem a certeza? Os {soldTicketsCount} bilhetes serão movidos permanentemente.</p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowTransferConfirm(false)}
                                                                className="flex-1 bg-white hover:bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-xs border border-slate-200 transition-colors"
                                                            >
                                                                Voltar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleTransfer}
                                                                disabled={isPending}
                                                                className="flex-1 bg-violet-700 hover:bg-violet-800 text-white py-2 rounded-lg font-bold text-xs transition-colors"
                                                            >
                                                                {isPending ? 'A processar...' : 'Sim, Transferir'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
                                <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2"><span className="material-symbols-outlined">warning</span>Zona de Perigo</h2>
                                {soldTicketsCount > 0 ? (
                                    <p className="text-sm text-red-600 font-semibold mb-2">
                                        Não é possível apagar este evento diretamente porque já foram vendidos bilhetes. 
                                        Utilize as opções de reembolso acima para cancelar as compras e libertar o evento para eliminação.
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-sm text-red-600/80 mb-6">Esta ação é irreversível. Todos os dados do evento serão permanentemente apagados.</p>
                                        {!showDeleteConfirm ? (
                                            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">delete_forever</span>Apagar Evento</button>
                                        ) : (
                                            <div className="bg-white p-4 rounded-xl border border-red-200 flex items-center justify-between">
                                                <p className="text-sm font-bold text-red-700">Tem a certeza? Esta ação não pode ser desfeita.</p>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                                                    <button type="button" onClick={handleDelete} disabled={isPending} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50">{isPending ? 'A apagar...' : 'Confirmar'}</button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Publicação */}
            {showPublishConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800 text-left">
                        <div className="flex items-center gap-3 mb-4 text-violet-700">
                            <span className="material-symbols-outlined text-3xl font-normal">campaign</span>
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
                                onClick={() => {
                                    setShowPublishConfirmModal(false);
                                    setConfirmText('');
                                    handleSave(true);
                                }} 
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
