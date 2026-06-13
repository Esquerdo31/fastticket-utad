"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getEventos } from '../actions/event';
import { getEventStatus, getEventStatusLabel, getEventStatusColor } from '@/lib/eventStatus';
import Header from '@/app/components/Header';
import { slugify } from '@/lib/slug';

type EventCard = {
    id: number;
    title: string;
    description?: string;
    date: string;
    startDate: string;
    location: string;
    price: string;
    priceValue: number;
    category: string;
    format?: string;
    organizador?: string;
    bannerUrl?: string | null;
    thumbnailUrl?: string | null;
    mostrarBanner?: boolean;
    mostrarLogo?: boolean;
    estado: string;
    dataInicio: string;
    dataFim?: string | null;
    lotes?: Array<{ nome: string; quantidadeDisponivel: number; lotacaoTotal: number }>;
};

const normalizeText = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDateRange = (filter: string) => {
    const dateFilter = normalizeText(filter);
    const now = new Date();
    const today = startOfDay(now);

    if (dateFilter === 'hoje') {
        return { start: today, end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) };
    }

    if (dateFilter === 'esta semana') {
        const day = today.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);
        return { start: weekStart, end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7) };
    }

    if (dateFilter === 'proximo mes' || filter.includes('ximo')) {
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: nextMonthStart, end: new Date(today.getFullYear(), today.getMonth() + 2, 1) };
    }

    return null;
};

const matchesCategory = (eventCategory: string, selectedCategory: string) => {
    const eventRaw = eventCategory.toLowerCase();
    const selectedRaw = selectedCategory.toLowerCase();
    const eventValue = normalizeText(eventCategory);
    const selectedValue = normalizeText(selectedCategory);

    if (selectedRaw.startsWith('confer')) return eventRaw.includes('confer') || eventValue.includes('confer');
    if (selectedRaw.startsWith('workshop')) return eventRaw.includes('workshop') || eventValue.includes('workshop');
    if (selectedRaw.startsWith('gala')) return eventRaw.includes('gala') || eventValue.includes('gala');
    if (selectedRaw.startsWith('festa')) return eventRaw.includes('festa') || eventValue.includes('festa');
    if (selectedRaw.startsWith('desporto')) return eventRaw.includes('desporto') || eventValue.includes('desporto');

    return eventValue === selectedValue;
};

const UTADFastTicket = () => {
    // --- Estados para Filtros e Pesquisa ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [location, setLocation] = useState('Todos');
    const [sortBy, setSortBy] = useState('Mais Recentes');
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [events, setEvents] = useState<EventCard[]>([]);

    useEffect(() => {
        getEventos().then((res) => {
            if (res.success && res.data) {
                setEvents(res.data as EventCard[]);
            }
        });
    }, []);

    // --- Funções de Manipulação ---
    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            }
            return [...prev, category];
        });
    };

    const handlePriceChange = (price: string) => {
        setSelectedPrices(prev =>
            prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]
        );
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedDate('');
        setSearchTerm('');
        setSelectedPrices([]);
        setLocation('Todos');
    };

    const filteredEvents = useMemo(() => {
        const search = normalizeText(searchTerm);
        const dateRange = getDateRange(selectedDate);

        return events
            .filter((event) => {
                const status = getEventStatus({
                    estado: event.estado,
                    dataInicio: event.dataInicio,
                    dataFim: event.dataFim,
                    lotes: event.lotes
                });

                if (status === 'TERMINADO' || status === 'RASCUNHO' || status === 'CANCELADO') {
                    return false;
                }

                if (search) {
                    const searchableText = normalizeText([
                        event.title,
                        event.description,
                        event.location,
                        event.category,
                        event.organizador,
                    ].filter(Boolean).join(' '));

                    if (!searchableText.includes(search)) return false;
                }

                if (selectedCategories.length > 0 && !selectedCategories.some((category) => matchesCategory(event.category, category))) {
                    return false;
                }

                if (dateRange) {
                    const eventDate = new Date(event.startDate);
                    if (Number.isNaN(eventDate.getTime()) || eventDate < dateRange.start || eventDate >= dateRange.end) {
                        return false;
                    }
                }

                if (location && location !== 'Todos') {
                    const selectedLocation = normalizeText(location);
                    const eventLocation = normalizeText(event.location || '');
                    const eventFormat = normalizeText(event.format || '');

                    if (selectedLocation === 'online') {
                        if (!eventLocation.includes('online') && eventFormat !== 'online') return false;
                    } else if (!eventLocation.includes(selectedLocation)) {
                        return false;
                    }
                }

                if (selectedPrices.length > 0) {
                    const isFree = event.priceValue === 0;
                    const isPaid = event.priceValue > 0;

                    if (!((selectedPrices.includes('Gratuito') && isFree) || (selectedPrices.includes('Pago') && isPaid))) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                const sort = normalizeText(sortBy);

                if (sort.startsWith('pre')) {
                    return a.priceValue - b.priceValue;
                }

                if (sort === 'mais recentes') {
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                }

                return 0;
            });
    }, [events, searchTerm, selectedCategories, selectedDate, location, selectedPrices, sortBy]);

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEvents.slice(start, start + itemsPerPage);
    }, [filteredEvents, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategories, selectedDate, location, selectedPrices, sortBy]);

    return (
        <div className="bg-[#f5f7f8] font-sans text-[#0f172a] antialiased min-h-screen pt-16">
            <Header />

            <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-12">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-[#0f172a] mb-4">Explorar Eventos</h1>
                        <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
                            Descubra conferências, galas e workshops na principal plataforma de bilheteira<br />académica da UTAD.
                        </p>
                    </div>
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#006837] transition-colors bg-white shadow-sm self-start md:self-end">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="pl-12 pr-4 py-3 bg-slate-50/50 border-none outline-none text-sm w-full md:w-80 placeholder:text-slate-400 font-medium"
                            placeholder="Procurar eventos..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-bold text-lg text-[#0f172a]">Filtros</h2>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-[#006837] text-sm font-semibold hover:underline"
                                >
                                    Limpar
                                </button>
                            </div>

                            {/* Categoria */}
                            <div className="mb-8">
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-4">Categoria</p>
                                <div className="space-y-4">
                                    {['Conferências', 'Workshops', 'Galas', 'Festa Académica', 'Desporto'].map((cat) => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                className="w-4 h-4 rounded border-slate-300 accent-[#006837] cursor-pointer"
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat)}
                                                onChange={() => handleCategoryChange(cat)}
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-[#006837] transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Data */}
                            <div className="mb-8">
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-4">Data</p>
                                <div className="space-y-4">
                                    {['Hoje', 'Esta Semana', 'Próximo Mês'].map((d) => (
                                        <label key={d} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                className="w-4 h-4 border-slate-300 accent-[#006837] cursor-pointer"
                                                name="date"
                                                type="radio"
                                                checked={selectedDate === d}
                                                onChange={() => setSelectedDate(d)}
                                            />
                                            <span className="text-sm text-slate-700">{d}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Localização */}
                            <div className="mb-8">
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-4">Localização</p>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006837] appearance-none"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    >
                                        <option>Todos</option>
                                        <option>Vila Real</option>
                                        <option>Porto</option>
                                        <option>Lisboa</option>
                                        <option>Online</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                                </div>
                            </div>

                            {/* Preço */}
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-4">Preço</p>
                                <div className="space-y-4">
                                    {['Gratuito', 'Pago'].map((p) => (
                                        <label key={p} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                className="w-4 h-4 rounded border-slate-300 accent-[#006837] cursor-pointer"
                                                type="checkbox"
                                                checked={selectedPrices.includes(p)}
                                                onChange={() => handlePriceChange(p)}
                                            />
                                            <span className="text-sm text-slate-700">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        {/* Sorting Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <span className="text-[13px] text-slate-500 font-medium">
                                A mostrar {filteredEvents.length} de {filteredEvents.length} eventos
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] text-slate-700 font-medium">Ordenar por:</span>
                                <div className="relative inline-block w-40">
                                    <select
                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-[13px] focus:outline-none focus:border-[#006837]"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option>Mais Recentes</option>
                                        <option>Preço (Baixo para Alto)</option>
                                        <option>Popularidade</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Event Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedEvents.map((event) => {
                                const status = getEventStatus({
                                    estado: event.estado,
                                    dataInicio: event.dataInicio,
                                    dataFim: event.dataFim,
                                    lotes: event.lotes
                                });
                                return (
                                    <Link href={`/evento/${event.id}-${slugify(event.title)}`} key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col">
                                        <div className={`relative h-44 overflow-hidden ${!event.bannerUrl ? 'bg-gradient-to-br from-[#0b2818] to-[#006837]' : ''} flex items-center justify-center p-6 text-center`}>
                                            {event.bannerUrl && <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />}
                                            {event.bannerUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />}
                                            <div className={`absolute top-4 left-4 bg-white/20 text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 z-10`}>
                                                {event.category}
                                            </div>
                                            {/* Status Badge */}
                                            <div className={`absolute top-4 right-4 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow ${getEventStatusColor(status)}`}>
                                                {getEventStatusLabel(status)}
                                            </div>
                                            <h2 className="text-2xl font-bold text-white opacity-90 drop-shadow-md relative z-10">
                                                {event.title}
                                            </h2>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-1.5 text-[#006837] font-bold text-[11px] mb-3">
                                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                {event.date}
                                            </div>
                                            <h3 className="text-lg font-bold text-[#0f172a] mb-2 leading-tight">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[13px] mb-6 flex-1">
                                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                {event.location}
                                            </div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div>
                                                    <p className="text-[9px] text-[#64748b] uppercase font-bold tracking-widest mb-0.5">
                                                        {event.price === 'Gratuito' ? 'Preço' : 'Desde'}
                                                    </p>
                                                    <p className="text-lg font-extrabold text-[#006837]">{event.price}</p>
                                                </div>
                                                <button type="button" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-[#006837] transition-colors group/btn">
                                                    <span className="material-symbols-outlined text-slate-600 group-hover/btn:text-white transition-colors">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                            {filteredEvents.length === 0 && (
                                <div className="md:col-span-2 xl:col-span-3 bg-white border border-slate-200 rounded-xl px-6 py-12 text-center">
                                    <p className="text-base font-bold text-slate-800 mb-2">Nenhum evento encontrado</p>
                                    <p className="text-sm text-slate-500">Experimenta ajustar os filtros ou limpar a pesquisa.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav className="mt-16 mb-8 flex justify-center items-center gap-2">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <span className="material-symbols-outlined text-slate-600 text-sm">chevron_left</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        type="button"
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                                            currentPage === p
                                                ? 'bg-[#006837] text-white'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <span className="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#080c14] text-slate-500 py-12 border-t border-white/5 w-full">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 mb-8 gap-6">
                        <div>
                            <div className="text-lg font-bold text-white uppercase tracking-widest mb-2">UTAD FastTicket</div>
                            <p className="max-w-sm text-sm">A plataforma digital oficial para gestão e aquisição de bilhetes para a comunidade de Vila Real.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-6">
                            <Link href="/sobre" className="hover:text-white transition-colors text-xs font-medium">Sobre</Link>
                            <Link href="/eventos" className="hover:text-white transition-colors text-xs font-medium text-white font-bold">Explorar Eventos</Link>
                            <Link href="/ajuda" className="hover:text-white transition-colors text-xs font-medium">Ajuda</Link>
                        </div>
                        <p className="text-xs">© 2026 UTAD FastTicket. Academia Portuguesa.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UTADFastTicket;
