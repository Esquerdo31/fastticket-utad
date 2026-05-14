"use client";
import React, { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventoById, updateEvento, deleteEvento } from '@/app/actions/evento';

type Tab = 'detalhes' | 'bilheteira' | 'media' | 'config';
interface Lote { nome: string; descricao: string; preco: number; lotacaoTotal: number; }

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

    useEffect(() => {
        if (!eventoId) return;
        getEventoById(eventoId).then(res => {
            if (res.success && res.data) {
                const d = res.data;
                setTitulo(d.titulo); setDescricao(d.descricao); setDataInicio(d.dataInicio);
                setDataFim(d.dataFim || ''); setLocalizacao(d.localizacao);
                setFormato(d.formato || 'presencial'); setCategoria(d.categoria || 'Conferência');
                setEstado(d.estado || 'RASCUNHO'); setBannerUrl(d.bannerUrl || '');
                setThumbnailUrl(d.thumbnailUrl || ''); setOrganizadorId(d.organizadorId);
                setMostrarBanner(d.mostrarBanner ?? true); setMostrarLogo(d.mostrarLogo ?? true);
                setLotes(d.lotes.map(l => ({ nome: l.nome, descricao: l.descricao, preco: l.preco, lotacaoTotal: l.lotacaoTotal })));
            }
            setLoading(false);
        });
    }, [eventoId]);

    const flash = (text: string, type: 'ok'|'err') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

    const handleSave = () => {
        startTransition(async () => {
            const res = await updateEvento(eventoId, { titulo, descricao, dataInicio, dataFim, localizacao, organizadorId, lotes, bannerUrl, thumbnailUrl, formato, categoria, estado, mostrarBanner, mostrarLogo });
            if (res.success) flash('Evento guardado com sucesso!', 'ok');
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

    const handleUpload = async (file: File, type: 'banner'|'thumbnail') => {
        setUploading(true);
        const fd = new FormData(); fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) { if (type === 'banner') setBannerUrl(data.url); else setThumbnailUrl(data.url); }
        else flash(data.message || 'Erro no upload.', 'err');
        setUploading(false);
    };

    const addLote = () => setLotes([...lotes, { nome: '', descricao: '', preco: 0, lotacaoTotal: 10 }]);
    const removeLote = (i: number) => { if (lotes.length > 1) setLotes(lotes.filter((_, idx) => idx !== i)); };
    const updateLote = (i: number, f: keyof Lote, v: string|number) => { const u = [...lotes]; (u[i] as any)[f] = v; setLotes(u); };
    const totalBilhetes = lotes.reduce((s, l) => s + l.lotacaoTotal, 0);

    const tabs: { id: Tab; icon: string; label: string }[] = [
        { id: 'detalhes', icon: 'description', label: 'Detalhes' },
        { id: 'bilheteira', icon: 'confirmation_number', label: 'Bilheteira' },
        { id: 'media', icon: 'image', label: 'Media' },
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
                        <button onClick={handleSave} disabled={isPending} className="bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-800 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
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
                            <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm ${tab === t.id ? 'bg-violet-700 text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <span className="material-symbols-outlined text-[20px]">{t.icon}</span>{t.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Mobile Tabs */}
                <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2 w-full">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.id ? 'bg-violet-700 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'}`}>
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
                                    <div><label className={labelCls}>Título do Evento</label><input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className={inputCls} placeholder="Nome do evento" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div><label className={labelCls}>Categoria</label>
                                            <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inputCls}><option>Conferência</option><option>Festa Académica</option><option>Desporto</option><option>Workshop</option><option>Outro</option></select>
                                        </div>
                                        <div><label className={labelCls}>Formato</label>
                                            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                                                <button type="button" onClick={() => setFormato('presencial')} className={`flex-1 py-3 font-bold text-sm rounded-lg transition-all ${formato === 'presencial' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>Presencial</button>
                                                <button type="button" onClick={() => setFormato('online')} className={`flex-1 py-3 font-bold text-sm rounded-lg transition-all ${formato === 'online' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500'}`}>Online</button>
                                            </div>
                                        </div>
                                        <div><label className={labelCls}>Localização</label><input type="text" value={localizacao} onChange={e => setLocalizacao(e.target.value)} className={inputCls} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className={labelCls}>Data e Hora de Início</label><input type="datetime-local" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={inputCls} /></div>
                                        <div><label className={labelCls}>Data e Hora de Fim</label><input type="datetime-local" value={dataFim} onChange={e => setDataFim(e.target.value)} className={inputCls} /></div>
                                    </div>
                                    <div><label className={labelCls}>Descrição Completa</label><textarea rows={12} value={descricao} onChange={e => setDescricao(e.target.value)} className={`${inputCls} resize-y`} placeholder="Descreva o evento em detalhe..." /></div>
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
                                    {lotes.map((lote, i) => (
                                        <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200 relative group">
                                            {lotes.length > 1 && <button type="button" onClick={() => removeLote(i)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-[20px]">delete</span></button>}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-2"><label className={labelCls}>Nome do Lote</label><input type="text" value={lote.nome} onChange={e => updateLote(i, 'nome', e.target.value)} className={inputCls} placeholder="Ex: Geral, VIP" /></div>
                                                <div><label className={labelCls}>Preço (€)</label><input type="number" min={0} step={0.01} value={lote.preco} onChange={e => updateLote(i, 'preco', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                                                <div><label className={labelCls}>Quantidade</label><input type="number" min={1} value={lote.lotacaoTotal} onChange={e => updateLote(i, 'lotacaoTotal', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                                            </div>
                                            <div className="mt-4"><label className={labelCls}>Descrição (Opcional)</label><input type="text" value={lote.descricao} onChange={e => updateLote(i, 'descricao', e.target.value)} className={inputCls} placeholder="Descrição do lote" /></div>
                                        </div>
                                    ))}
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

                    {/* TAB: CONFIGURAÇÕES */}
                    {tab === 'config' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-violet-700">visibility</span>Estado do Evento</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(['RASCUNHO', 'PUBLICADO', 'CANCELADO'] as const).map(e => (
                                        <button key={e} onClick={() => setEstado(e)} className={`p-5 rounded-xl border-2 transition-all text-left ${estado === e ? 'border-violet-700 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest mb-2 ${estadoBadge[e]}`}>{e}</span>
                                            <p className="text-xs text-slate-500">{e === 'RASCUNHO' ? 'Evento visível apenas para si. Pode editar livremente.' : e === 'PUBLICADO' ? 'Evento visível publicamente. Bilhetes à venda.' : 'Evento cancelado. Não aceita mais compras.'}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
                                <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2"><span className="material-symbols-outlined">warning</span>Zona de Perigo</h2>
                                <p className="text-sm text-red-600/80 mb-6">Esta ação é irreversível. Todos os dados do evento serão permanentemente apagados.</p>
                                {!showDeleteConfirm ? (
                                    <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">delete_forever</span>Apagar Evento</button>
                                ) : (
                                    <div className="bg-white p-4 rounded-xl border border-red-200 flex items-center justify-between">
                                        <p className="text-sm font-bold text-red-700">Tem a certeza? Esta ação não pode ser desfeita.</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                                            <button onClick={handleDelete} disabled={isPending} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50">{isPending ? 'A apagar...' : 'Confirmar'}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
