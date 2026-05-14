"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActiveSession, logoutUser } from '../actions/auth';
import { getEventos } from '../actions/event';

const UTADFastTicket = () => {
    // --- Estados para Filtros e Pesquisa ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [location, setLocation] = useState('Vila Real');
    const [sortBy, setSortBy] = useState('Mais Recentes');
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

    const [events, setEvents] = useState<any[]>([]);
    const [userSession, setUserSession] = useState<any>(null);

    useEffect(() => {
        getActiveSession().then(setUserSession);
        getEventos().then((res) => {
            if (res.success && res.data) {
                setEvents(res.data);
            }
        });
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        setUserSession(null);
    };

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
        setLocation('Vila Real');
    };

    return (
        <div className="bg-[#f5f7f8] font-sans text-[#0f172a] antialiased min-h-screen">
            {/* ------------------------------------------------------------------ */}
            {/* Header / TopAppBar                                                 */}
            {/* ------------------------------------------------------------------ */}
            <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#006837] hover:opacity-80 transition-opacity">
                            UTAD FastTicket
                        </Link>
                        <nav className="hidden md:flex gap-6">
                            <Link href="/eventos" className="text-sm font-medium text-slate-600 hover:text-[#006837]">Explorar</Link>
                            <Link href="/sobre" className="text-sm font-medium text-slate-600 hover:text-[#006837]">Sobre</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="relative hidden lg:block border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#006837] transition-colors">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input
                                className="pl-9 pr-4 py-2 bg-slate-50 border-none outline-none text-[13px] w-64 placeholder:text-slate-400"
                                placeholder="Procurar eventos..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {userSession ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard/utilizador" className="text-sm font-bold text-white bg-[#006837] px-4 py-2 rounded-lg whitespace-nowrap shadow-md hover:bg-emerald-800 transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    {userSession.nome || userSession.email.split("@")[0]}
                                </Link>
                                <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                    Sair
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-[#006837] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-[44px] font-bold tracking-tight text-[#0f172a] mb-4">Explorar Eventos</h1>
                    <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
                        Descubra conferências, galas e workshops na principal plataforma de bilheteira<br />académica da UTAD.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-bold text-lg text-[#0f172a]">Filtros</h2>
                                <button
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
                                    {['Conferências', 'Workshops', 'Galas', 'Desporto'].map((cat) => (
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
                            <span className="text-[13px] text-slate-500 font-medium">A mostrar 12 de 48 eventos</span>
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
                            {events.map((event) => (
                                <Link href={`/evento/${event.id}`} key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col">
                                    <div className={`relative h-44 overflow-hidden ${!event.bannerUrl ? 'bg-gradient-to-br from-[#0b2818] to-[#006837]' : ''} flex items-center justify-center p-6 text-center`}>
                                        {event.bannerUrl && <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />}
                                        {event.bannerUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />}
                                        <div className={`absolute top-4 left-4 bg-white/20 text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 z-10`}>
                                            {event.category}
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
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-[#006837] transition-colors group/btn">
                                                <span className="material-symbols-outlined text-slate-600 group-hover/btn:text-white transition-colors">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        <nav className="mt-16 mb-8 flex justify-center items-center gap-2">
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-slate-600 text-sm">chevron_left</span>
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#006837] text-white font-bold text-sm">1</button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">2</button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">3</button>
                            <span className="mx-1 text-slate-400">...</span>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">8</button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#0b2818] py-16">
                <div className="w-full max-w-[1400px] mx-auto px-6 md:px-8 flex flex-col lg:flex-row justify-between items-start gap-12">
                    <div className="flex flex-col flex-1 max-w-sm">
                        <div className="text-lg font-bold text-white tracking-widest mb-4">
                            UTAD FASTTICKET
                        </div>
                        <p className="text-emerald-200/60 text-[13px] leading-relaxed">
                            Potenciando a experiência académica através da digitalização de eventos e acesso institucional.
                        </p>
                    </div>
                    <div className="flex flex-wrap lg:justify-center gap-x-8 gap-y-4 font-sans text-sm flex-1 text-emerald-200/60 pt-1">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Institutional Access</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
                    </div>
                    <div className="text-emerald-500/80 text-[13px] flex-1 lg:text-right pt-1 flex flex-col">
                        <span>© 2024 UTAD FastTicket.</span>
                        <span>The Digital Atheneum.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UTADFastTicket;