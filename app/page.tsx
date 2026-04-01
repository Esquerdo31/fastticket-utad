"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveSession, logoutUser } from "./actions/auth";
import { getEventos } from "./actions/event";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeatureProps {
    icon: string;
    title: string;
    description: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MaterialIcon({
    name,
    className = "",
}: {
    name: string;
    className?: string;
}) {
    return (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );
}

function FeatureItem({ icon, title, description }: FeatureProps) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-50">
                <MaterialIcon name={icon} className="text-3xl text-[#006837]" />
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function UTADFastTicketPage() {
    const router = useRouter();
    const [searchForm, setSearchForm] = useState({
        event: "",
        date: "",
        category: "Todas as Categorias",
    });

    const [userSession, setUserSession] = useState<any>(null);
    const [dbEvents, setDbEvents] = useState<any[]>([]);

    useEffect(() => {
        getActiveSession().then(setUserSession);
        // Trazer eventos e ficar com os últimos 3
        getEventos().then(res => {
            if (res.success && res.data) {
                setDbEvents(res.data.slice(0, 3));
            }
        });
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        setUserSession(null);
    };

    const handleSearchChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setSearchForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = () => {
        router.push("/eventos");
    };

    const features: FeatureProps[] = [
        {
            icon: "bolt",
            title: "Simplicidade",
            description:
                "Compra o teu bilhete em menos de 30 segundos. Sem filas, sem esperas, tudo no teu telemóvel.",
        },
        {
            icon: "verified_user",
            title: "Segurança Académica",
            description:
                "Autenticação oficial via credenciais UTAD. Garantia de bilhetes legítimos e transações seguras.",
        },
        {
            icon: "hub",
            title: "Integração Total",
            description:
                "Sincroniza os eventos com o teu calendário académico e recebe notificações de última hora.",
        },
    ];

    const socialLinks = [
        { alt: "Facebook", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWaTco4V6jlYxONyqFNccNuNy_xt4_UmPHBPUmK4IF5mDscRR7mcDFY5rfE_jiu5wBa-6EIoYCYiLKbHxUXWeCLmudh4O96uhDxSOFxirPJ7AS5ZHdST-Rlia22drDUk1EBYeM5n_MQE-WEuewwsz7KSSskbbM8f4C3ePWxppUnlBjJQhL9CGylD_I_AsrTcBeUO316Wxm-0FE0vbzlSNskoAkPET__QAH4beVKXN9mimZTK6WCMHuREb1k5ULKhTFFAWHpgTXL9M" },
        { alt: "Instagram", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8lnSHDUuUJuphF4ehXrcUAxAzALbzDw4w-x9pGrf8maZastY6MNd55X82SK1EJUmjMxj150Gcn5SBijW1ZCPLJLqTFVSxtBjiwYD5DEl4AbFDX0gVPpU6C--Haczr_MTqvCaEzQr1gKnffkgm2EirEmCwborsWFGbOO4V0QEoejausS-6403FSdfyCG3yIL6eciAztE74NgQ-EDqdmUMIZs3LuDRtudZ93YrfsBw19OLNiAkwzNI7ef8l-0FsIApjP1i31NqVVNw" },
        { alt: "X", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDovgI6w4MHmPrZzCYMijUivl_BglYlISoclbMy1melCg66fxl0YD73OI3iPogzGE6efqrHkFXWHs3UFAglzXgn1TCTi3XZZmqyvU4uJmWiUcyzYoi2FaAtl05-KafaVWOLTtrnt0u5Bc4C7UrG_BROZv6EJiZFkJbrvdG2gVjCkS018iyr34Guqb65AOXk5AXZWhjF0I7mYCBYX5Qmo8SsD3nabsVAM_Xnf6b_zkdo01mYefA5YmSMTJJb_6M0uDdKkFs4vytBcZQ" },
    ];

    return (
        <>
            <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .emerald-veil {
          background: linear-gradient(to bottom, rgba(0, 77, 41, 0.85), rgba(0, 104, 55, 0.95));
        }
        .institutional-shadow {
          box-shadow: 0 25px 50px -12px rgba(0, 104, 55, 0.15);
        }
      `}</style>

            <div className="bg-[#f5f7f8] font-sans text-slate-800 antialiased min-h-screen">
                {/* ------------------------------------------------------------------ */}
                {/* Header / TopAppBar                                                   */}
                {/* ------------------------------------------------------------------ */}
                <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-200">
                    <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                        <Link
                            href="/"
                            className="text-2xl font-bold tracking-tighter text-[#006837] hover:opacity-80 transition-opacity"
                        >
                            UTAD FastTicket
                        </Link>

                        <div className="flex items-center gap-4">
                            <button
                                aria-label="Search"
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-600 transition-all"
                            >
                                <MaterialIcon name="search" className="text-xl" />
                            </button>
                            {userSession ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/dashboard/utilizador" className="text-sm font-bold text-white bg-[#006837] px-4 py-2 rounded-lg whitespace-nowrap shadow-md hover:bg-emerald-800 transition-colors flex items-center gap-2">
                                        <MaterialIcon name="person" className="text-sm" />
                                        {userSession.nome || userSession.email.split("@")[0]}
                                    </Link>
                                    <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                        Sair
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="bg-[#006837] text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-[#006837]/20 hover:scale-105 active:scale-95 duration-200">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    {/* ---------------------------------------------------------------- */}
                    {/* Hero Section                                                       */}
                    {/* ---------------------------------------------------------------- */}
                    <section className="relative min-h-[870px] flex items-center overflow-hidden bg-gradient-to-br from-[#0b2818] via-[#004d29] to-[#006837]">
                        {/* Padrão Geométrico Institucional em vez de foto */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

                        <div className="absolute inset-0 emerald-veil" />

                        {/* Content */}
                        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col items-start w-full">
                            <span className="text-emerald-300 tracking-widest text-xs mb-4 uppercase font-bold">
                                Portal Oficial de Eventos Académicos
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 max-w-3xl drop-shadow-md">
                                Os melhores eventos da academia começam aqui
                            </h1>
                            <p className="text-xl text-white/90 mb-10 max-w-2xl font-light leading-relaxed">
                                Descobre festas, palestras, competições desportivas e workshops exclusivos para a comunidade UTAD.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-16">
                                {!userSession && (
                                    <Link href="/login" className="bg-white text-[#006837] px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center">
                                        Criar Conta
                                    </Link>
                                )}
                                <Link href="/eventos" className="bg-[#004d29]/40 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#004d29]/60 transition-all flex items-center justify-center">
                                    Explorar Agenda
                                </Link>
                            </div>

                            {/* Search Bar */}
                            <div className="w-full max-w-5xl bg-white p-2 rounded-xl institutional-shadow grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                <div className="flex items-center gap-3 px-4 py-3 md:border-r border-slate-100">
                                    <MaterialIcon name="local_activity" className="text-[#006837]" />
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Evento</label>
                                        <input
                                            name="event"
                                            type="text"
                                            placeholder="Procurar..."
                                            value={searchForm.event}
                                            onChange={handleSearchChange}
                                            className="border-none p-0 focus:ring-0 text-slate-800 font-medium placeholder:text-slate-300 outline-none w-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 md:border-r border-slate-100">
                                    <MaterialIcon name="calendar_month" className="text-[#006837]" />
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Data</label>
                                        <input
                                            name="date"
                                            type="date"
                                            value={searchForm.date}
                                            onChange={handleSearchChange}
                                            className="border-none p-0 focus:ring-0 text-slate-800 font-medium cursor-pointer outline-none w-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3">
                                    <MaterialIcon name="category" className="text-[#006837]" />
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Categoria</label>
                                        <select
                                            name="category"
                                            value={searchForm.category}
                                            onChange={handleSearchChange}
                                            className="border-none p-0 focus:ring-0 text-slate-800 font-medium bg-transparent cursor-pointer outline-none w-full"
                                        >
                                            <option>Todas as Categorias</option>
                                            <option>Académico</option>
                                            <option>Desporto</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSearch}
                                    className="bg-[#006837] text-white h-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
                                >
                                    <MaterialIcon name="search" />
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ---------------------------------------------------------------- */}
                    {/* Events in High Demand — Dynamic Grid                              */}
                    {/* ---------------------------------------------------------------- */}
                    <section className="py-24 px-6 max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-bold tracking-tight text-[#006837] mb-2">
                                    Eventos em Alta
                                </h2>
                                <p className="text-slate-500 font-medium">
                                    O que a UTAD está a falar neste momento.
                                </p>
                            </div>
                            <Link href="/eventos" className="text-[#006837] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Ver todos os eventos <MaterialIcon name="arrow_forward" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {dbEvents.length > 0 ? (
                                dbEvents.map((ev: any, index: number) => (
                                    <Link href={`/evento/${ev.id}`} key={ev.id} className={`${index === 0 ? 'md:col-span-2' : ''} group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all ${index === 0 ? 'h-[400px]' : 'h-[400px]'} border border-slate-200 flex flex-col`}>
                                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#0b2818] to-[#006837] flex items-center justify-center p-6 text-center">
                                            <div className="absolute top-4 left-4 bg-white/20 text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30">
                                                {ev.category || "EVENTO"}
                                            </div>
                                            <h3 className="text-white font-black text-2xl group-hover:scale-105 transition-transform duration-500 drop-shadow-md">{ev.title}</h3>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
                                                    <MaterialIcon name="calendar_today" className="text-[16px] text-[#006837]" />
                                                    {ev.date}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                    <MaterialIcon name="location_on" className="text-[16px] text-[#006837]" />
                                                    {ev.location}
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                <span className="font-extrabold text-[#006837] text-lg">{ev.price}</span>
                                                <button className="h-10 px-5 rounded-lg bg-emerald-50 text-[#006837] font-bold group-hover:bg-[#006837] group-hover:text-white transition-colors">
                                                    Detalhes
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-1 md:col-span-3 py-10 text-center bg-white border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-slate-500 font-medium">A carregar eventos em destaque...</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ---------------------------------------------------------------- */}
                    {/* Why UTAD FastTicket                                               */}
                    {/* ---------------------------------------------------------------- */}
                    <section className="bg-slate-100 py-24 border-y border-slate-200">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold tracking-tight text-[#006837] mb-4">
                                    Porquê o UTAD FastTicket?
                                </h2>
                                <p className="text-slate-600 max-w-2xl mx-auto font-medium">
                                    Criámos a solução ideal para gerires a tua vida social e académica sem complicações.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {features.map((f) => (
                                    <FeatureItem key={f.title} {...f} />
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* ------------------------------------------------------------------ */}
                {/* Footer                                                               */}
                {/* ------------------------------------------------------------------ */}
                <footer className="bg-[#0b2818] text-emerald-200/60 py-16">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-12 mb-12 gap-8">
                            <div className="flex flex-col">
                                <div className="text-lg font-bold text-white uppercase tracking-widest mb-4">
                                    UTAD FastTicket
                                </div>
                                <p className="max-w-sm text-sm">
                                    A plataforma digital oficial para gestão e aquisição de bilhetes para a comunidade de Vila Real.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                {socialLinks.map(({ alt, src }) => (
                                    <Link key={alt} href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" aria-label={alt}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={src} alt={alt} width={20} height={20} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex flex-wrap gap-8">
                                {["Política de Privacidade", "Termos de Serviço", "Acesso Institucional"].map((label) => (
                                    <Link key={label} href="#" className="hover:text-white transition-colors hover:underline underline-offset-4 text-sm font-medium">
                                        {label}
                                    </Link>
                                ))}
                            </div>
                            <p className="text-xs tracking-wide">
                                © 2026 UTAD FastTicket. Academia Portuguesa.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}