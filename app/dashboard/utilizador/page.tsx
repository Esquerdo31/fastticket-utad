import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import { getDashboardData } from '@/app/actions/dashboard';
import Link from 'next/link';

export default async function UserDashboard() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    const dashboard = await getDashboardData(session.userId);

    const nextEvents = dashboard.nextEvents || [];
    const suggestions = dashboard.suggestedEvents || [];
    const userName = dashboard.userName || "Participante";

    return (
        <div className="bg-[#f8fafc] text-slate-800 min-h-screen font-sans">
            {/* TopAppBar */}
            <header className="fixed top-0 z-50 w-full bg-white shadow-sm flex justify-between items-center px-6 py-3 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-[#006837] tracking-tight hover:opacity-80 transition-opacity">UTAD FastTicket</Link>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-8 items-center">
                        <Link className="text-[#006837] font-bold tracking-tight" href="/eventos">Explorar Eventos</Link>
                        <a className="text-slate-600 hover:bg-slate-50 transition-colors px-2 py-1 rounded font-medium" href="#">Ajuda</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                            <span className="text-sm font-semibold text-[#006837]">{userName}</span>
                            <span className="material-symbols-outlined text-[#006837]">account_circle</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex min-h-screen pt-16">
                {/* SideNavBar (Desktop) */}
                <aside className="fixed left-0 top-0 h-full w-64 bg-white flex flex-col pt-20 pb-6 hidden md:flex border-r border-slate-200">
                    <div className="px-6 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-[#006837] flex items-center justify-center text-white font-black text-lg">U</div>
                            <div>
                                <p className="text-lg font-black text-[#006837] leading-none">Portal UTAD</p>
                                <p className="text-[10px] uppercase tracking-widest text-[#006837]/60 mt-1">Participante</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1">
                        <a className="flex items-center gap-3 px-6 py-4 text-[#006837] font-bold border-r-4 border-[#006837] bg-emerald-50/50 transition-all duration-200 block" href="#">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm tracking-wide">Dashboard</span>
                        </a>
                        <a className="flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-[#006837] hover:bg-emerald-50 transition-all duration-200 block" href="#">
                            <span className="material-symbols-outlined">confirmation_number</span>
                            <span className="text-sm tracking-wide">Meus Bilhetes</span>
                        </a>
                        <a className="flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-[#006837] hover:bg-emerald-50 transition-all duration-200 block" href="#">
                            <span className="material-symbols-outlined">payments</span>
                            <span className="text-sm tracking-wide">Faturação</span>
                        </a>
                        <a className="flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-[#006837] hover:bg-emerald-50 transition-all duration-200 block" href="#">
                            <span className="material-symbols-outlined">person</span>
                            <span className="text-sm tracking-wide">Definições</span>
                        </a>
                    </nav>

                    <div className="px-4">
                        <Link href="/eventos" className="w-full bg-[#006837] text-white py-3 rounded-lg font-semibold shadow-lg shadow-[#006837]/20 hover:bg-emerald-800 active:scale-95 transition-all flex items-center justify-center">
                            Comprar Bilhetes
                        </Link>
                    </div>
                </aside>

                {/* Main Content Canvas */}
                <main className="flex-1 md:ml-64 p-6 lg:p-10">

                    {/* Welcome Section (Sem Imagens) */}
                    <section className="mb-10">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0b2818] via-[#004d29] to-[#006837] p-8 lg:p-12 text-white shadow-xl shadow-[#0b2818]/10">
                            {/* Padrão Geométrico Institucional em vez de foto */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                            
                            <div className="relative z-10">
                                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-300 mb-2">Painel Pessoal</p>
                                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">Bem-vindo(a), {userName.split(" ")[0]}.</h1>
                                <p className="text-lg opacity-90 max-w-xl leading-relaxed">
                                    {nextEvents.length > 0 
                                        ? `Tens ${nextEvents.length} eventos agendados. O teu acesso digital académico está garantido.`
                                        : `Ainda não compraste nenhum bilhete. Visita a página de eventos para explorares a agenda!`}
                                </p>
                            </div>
                            {/* Decorative Icon */}
                            <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] opacity-10 rotate-12 select-none">school</span>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Next Events Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Próximos Eventos</h2>
                                <Link href="/eventos" className="text-[#006837] font-semibold text-sm hover:underline">Ver Agenda Completa</Link>
                            </div>

                            <div className="space-y-4">
                                {nextEvents.length > 0 ? nextEvents.map((event: any) => (
                                    <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200 flex flex-col md:flex-row group">
                                        <div className="md:w-48 h-32 md:h-auto relative overflow-hidden bg-gradient-to-br from-[#0b2818] to-[#006837] flex items-center justify-center p-4">
                                            <div className="text-center text-white">
                                                <p className="font-extrabold text-3xl opacity-90">{event.day}</p>
                                                <p className="text-xs uppercase tracking-widest font-bold opacity-70 mt-1">{event.month}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                        BILHETE PAGO
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold mb-2 group-hover:text-[#006837] transition-colors">{event.title}</h3>
                                                <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <span className="material-symbols-outlined text-[#006837] text-[18px]">schedule</span>
                                                    <span className="text-sm font-semibold">{event.time}</span>
                                                </div>
                                                <button className="flex items-center gap-2 bg-[#006837] text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform hover:bg-emerald-800">
                                                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                                    Aceder QR Code
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">confirmation_number</span>
                                        <p className="text-slate-500 font-medium">Nenhum evento pago encontrado.</p>
                                        <Link href="/eventos" className="inline-block mt-4 text-[#006837] font-bold hover:underline">Explorar Eventos</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggestions for You Section */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Recomendações</h2>
                            <div className="space-y-4">
                                {suggestions.map((suggestion: any) => (
                                    <Link href={`/evento/${suggestion.id}`} key={suggestion.id} className="block bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-[#006837]/40 transition-all group">
                                        <div className="h-32 relative bg-gradient-to-br from-[#0b2818] to-[#006837] p-6 flex items-center justify-center text-center">
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                    Recomendado
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-white leading-tight drop-shadow-md">{suggestion.title}</h4>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-1.5 text-[#006837] text-xs font-bold mb-2">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {suggestion.date}
                                            </div>
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{suggestion.description}</p>
                                            <div className="w-full py-2 border border-[#006837] text-[#006837] text-xs font-bold rounded-lg group-hover:bg-[#006837] group-hover:text-white transition-colors text-center">
                                                Ver Detalhes
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* BottomNavBar (Mobile only) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-lg flex justify-around items-center py-3 px-4 z-50">
                <a className="flex flex-col items-center gap-1 text-[#006837] font-bold" href="#">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px]">Painel</span>
                </a>
                <a className="flex flex-col items-center gap-1 text-slate-500" href="#">
                    <span className="material-symbols-outlined">confirmation_number</span>
                    <span className="text-[10px]">Bilhetes</span>
                </a>
                <a className="flex flex-col items-center gap-1 text-slate-500" href="/eventos">
                    <span className="material-symbols-outlined">search</span>
                    <span className="text-[10px]">Agenda</span>
                </a>
                <a className="flex flex-col items-center gap-1 text-slate-500" href="#">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px]">Perfil</span>
                </a>
            </nav>
        </div>
    );
}