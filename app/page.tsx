"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveSession, logoutUser } from "./actions/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventCardSecondaryProps {
    imageSrc: string;
    imageAlt: string;
    title: string;
    schedule: string;
    price: string;
    ctaLabel: string;
}

interface FeatureProps {
    icon: string;
    title: string;
    description: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NavLink({
    href,
    active,
    children,
}: {
    href: string;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={
                active
                    ? "text-emerald-700 border-b-2 border-emerald-700 pb-1 font-semibold"
                    : "text-slate-600 hover:text-emerald-800 transition-colors"
            }
        >
            {children}
        </Link>
    );
}

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

function SecondaryEventCard({
    imageSrc,
    imageAlt,
    title,
    schedule,
    price,
    ctaLabel,
}: EventCardSecondaryProps) {
    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100">
            <div className="h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            <div className="p-5">
                <h4 className="font-bold text-lg mb-2 text-on-surface">{title}</h4>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                    <MaterialIcon name="schedule" className="text-sm" />
                    {schedule}
                </p>
                <div className="flex justify-between items-center">
                    <span className="text-primary font-bold">{price}</span>
                    <button className="text-sm font-semibold border border-primary text-primary px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">
                        {ctaLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, description }: FeatureProps) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-50">
                <MaterialIcon name={icon} className="text-3xl text-primary" />
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

    useEffect(() => {
        getActiveSession().then(setUserSession);
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

    const secondaryEvents: EventCardSecondaryProps[] = [
        {
            imageSrc:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBoFQL5ZnM5WEKh5aqMQTTX3xnkgHY5iWupti0sZHGNAq29IwlXhuLlbYJCKqBaOZcq9x5RjHHn_tLyqDdO0DjdY2RtxlIqq4WV9LDT0MgPNReuT4IXruUKTnY3e6Q5GPTACvEFtPkw_Fvaa43BqU2uYDaAYJdVVK4LsFsrOOHETeRkOAcdKuyW-WGAsJXXH7C3bUTdAHDtCXsOXZEtDd71PD8GbGZO4HiItvJ5yIj6H2CoeG7cBinTS9m5YPGHT90i9YUIYosrJ_s",
            imageAlt: "Sports Event",
            title: "Torneio Inter-Cursos Futsal",
            schedule: "Amanhã, 18:00",
            price: "Grátis",
            ctaLabel: "Bilhetes",
        },
        {
            imageSrc:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuB6Yc2MOkJ4_aXYoIiVA68kZZn-yxZQiYtdUysjxKefEvQhtaBxe1j9bbbc6Rt-Dy1N9v4Ym7tU9M4yfCumpZvKf_wTo-btfKDW-G3TU8dYyYuZm0OTnGENS3-iShxjizQSUUM7IIy_0-djsKGyY10kvZWFYfye6F7NoMnJhFtFK1fK-1R_UTb5YxQ85y7JrbIlfzonc5HbBwe7hxWHiAiz5--IVBOK37Lkjf7WD0lPuirqiq2eHcgMPdB-QB_qhMKCXirj_FWROQ8",
            imageAlt: "Workshop",
            title: "Workshop: IA no Estudo",
            schedule: "05 Dez, 14:30",
            price: "5.00€",
            ctaLabel: "Inscrição",
        },
    ];

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
        {
            alt: "Facebook",
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWaTco4V6jlYxONyqFNccNuNy_xt4_UmPHBPUmK4IF5mDscRR7mcDFY5rfE_jiu5wBa-6EIoYCYiLKbHxUXWeCLmudh4O96uhDxSOFxirPJ7AS5ZHdST-Rlia22drDUk1EBYeM5n_MQE-WEuewwsz7KSSskbbM8f4C3ePWxppUnlBjJQhL9CGylD_I_AsrTcBeUO316Wxm-0FE0vbzlSNskoAkPET__QAH4beVKXN9mimZTK6WCMHuREb1k5ULKhTFFAWHpgTXL9M",
        },
        {
            alt: "Instagram",
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8lnSHDUuUJuphF4ehXrcUAxAzALbzDw4w-x9pGrf8maZastY6MNd55X82SK1EJUmjMxj150Gcn5SBijW1ZCPLJLqTFVSxtBjiwYD5DEl4AbFDX0gVPpU6C--Haczr_MTqvCaEzQr1gKnffkgm2EirEmCwborsWFGbOO4V0QEoejausS-6403FSdfyCG3yIL6eciAztE74NgQ-EDqdmUMIZs3LuDRtudZ93YrfsBw19OLNiAkwzNI7ef8l-0FsIApjP1i31NqVVNw",
        },
        {
            alt: "X",
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDovgI6w4MHmPrZzCYMijUivl_BglYlISoclbMy1melCg66fxl0YD73OI3iPogzGE6efqrHkFXWHs3UFAglzXgn1TCTi3XZZmqyvU4uJmWiUcyzYoi2FaAtl05-KafaVWOLTtrnt0u5Bc4C7UrG_BROZv6EJiZFkJbrvdG2gVjCkS018iyr34Guqb65AOXk5AXZWhjF0I7mYCBYX5Qmo8SsD3nabsVAM_Xnf6b_zkdo01mYefA5YmSMTJJb_6M0uDdKkFs4vytBcZQ",
        },
    ];

    return (
        <>
            {/*
       * Global styles that can't be expressed with Tailwind alone.
       * In a real project these would live in globals.css or a CSS module.
       */}
            <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .emerald-veil {
          background: linear-gradient(
            to bottom,
            rgba(0, 77, 41, 0.75),
            rgba(0, 104, 55, 0.9)
          );
        }
        .institutional-shadow {
          box-shadow: 0 25px 50px -12px rgba(0, 104, 55, 0.15);
        }
      `}</style>

            <div className="bg-[#f5f7f8] font-sans text-[#0f172a] antialiased">
                {/* ------------------------------------------------------------------ */}
                {/* Header / TopAppBar                                                   */}
                {/* ------------------------------------------------------------------ */}
                <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-200">
                    <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                        <Link
                            href="/"
                            className="text-2xl font-bold tracking-tighter text-emerald-900"
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
                                    <span className="text-sm font-semibold text-emerald-900 border px-3 py-1.5 rounded-lg border-emerald-200">
                                        Olá, {userSession.email.split("@")[0]}
                                    </span>
                                    <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:underline">
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
                    <section className="relative min-h-[870px] flex items-center overflow-hidden">
                        {/* Background image + veil */}
                        <div className="absolute inset-0 z-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbbRiVwD8xb5oEZRTcLIYhp8_KvtA1yDlspRjP3uTjyqe4UGwbEN49Ok9hle3bkK-YeNq1Fk7ZWnn3MnogGBIYMuHydPS3uQ-LaJ1FFThDTyPm7PR6raTuAnnmfYy_NI6qNWHqrjLVtJLGjxS2nfBB9AuiybuobY7VNBp7bXNbfymCeQ5QbUluo5m68HDl5rfl-S6WE0QGr-9MqB7N8vp6izQno4WWLMibwfAY5RvUuXkuQG1AJyZv1nA9n5HfKhQprLBGS7LtTYY"
                                alt="UTAD Campus"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 emerald-veil" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col items-start">
                            <span className="text-white/80 tracking-widest text-xs mb-4 uppercase">
                                Portal Oficial de Eventos Académicos
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 max-w-3xl">
                                Os melhores eventos da academia começam aqui
                            </h1>
                            <p className="text-xl text-white/90 mb-10 max-w-2xl font-light leading-relaxed">
                                Descobre festas, palestras, competições desportivas e workshops
                                exclusivos para a comunidade UTAD. Tudo o que precisas num só
                                lugar.
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
                                {/* Event */}
                                <div className="flex items-center gap-3 px-4 py-3 md:border-r border-slate-100">
                                    <MaterialIcon name="local_activity" className="text-[#006837]" />
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                            Evento
                                        </label>
                                        <input
                                            name="event"
                                            type="text"
                                            placeholder="Nome do evento..."
                                            value={searchForm.event}
                                            onChange={handleSearchChange}
                                            className="border-none p-0 focus:ring-0 text-[#0f172a] font-medium placeholder:text-slate-300 outline-none w-full"
                                        />
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-3 px-4 py-3 md:border-r border-slate-100">
                                    <MaterialIcon name="calendar_month" className="text-[#006837]" />
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                            Data
                                        </label>
                                        <input
                                            name="date"
                                            type="date"
                                            value={searchForm.date}
                                            onChange={handleSearchChange}
                                            className="border-none p-0 focus:ring-0 text-[#0f172a] font-medium cursor-pointer outline-none w-full"
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <MaterialIcon name="category" className="text-[#006837]" />
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                            Categoria
                                        </label>
                                        <select
                                            name="category"
                                            value={searchForm.category}
                                            onChange={handleSearchChange}
                                            className="border-none p-0 focus:ring-0 text-[#0f172a] font-medium bg-transparent cursor-pointer outline-none w-full"
                                        >
                                            <option>Todas as Categorias</option>
                                            <option>Académico</option>
                                            <option>Desporto</option>
                                            <option>Cultura</option>
                                            <option>Festas</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Search button */}
                                <button
                                    onClick={handleSearch}
                                    className="bg-[#006837] text-white h-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
                                >
                                    <MaterialIcon name="search" />
                                    Pesquisar
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ---------------------------------------------------------------- */}
                    {/* Events in High Demand — Bento Grid                                */}
                    {/* ---------------------------------------------------------------- */}
                    <section className="py-24 px-6 max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-4xl font-bold tracking-tight text-emerald-900 mb-2">
                                    Eventos em Alta
                                </h2>
                                <p className="text-slate-500">
                                    O que a UTAD está a falar neste momento.
                                </p>
                            </div>
                            <Link
                                href="#"
                                className="text-[#006837] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                Ver todos os eventos{" "}
                                <MaterialIcon name="arrow_forward" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Large Feature Card */}
                            <div className="md:col-span-2 group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all h-[500px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoar96EQTBILQugI282lXrIwCiv1wIZFcidjGaZXipOCBPG0V2S6VqFt2-VPcG65cI1rqH55-n6GXXiQxg5i8a18LlxV6iYR3bXyDLMVewuKA53K8mzB5-MmnWPCbccrgWjBq9MUl8iuiFsO7LmGUzch2sdki9dX-FDQ8_9a0hE0Df6OaPy8lpnM4p40a0ebwC7TVnTFnD7uC6d4z2Fu0-vDo9_v3hyzpsmPqFq5rGOUPQcqWQeVCc_UCii134gH_0K10Oe4Fw1go"
                                    alt="Gala Académica"
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8 text-white">
                                    <span className="bg-[#006837] px-3 py-1 rounded text-xs font-bold uppercase mb-4 inline-block">
                                        Destaque
                                    </span>
                                    <h3 className="text-3xl font-bold mb-2">
                                        Gala de Natal UTAD 2024
                                    </h3>
                                    <div className="flex items-center gap-6 text-sm text-white/80">
                                        <span className="flex items-center gap-1">
                                            <MaterialIcon name="calendar_today" className="text-sm" />
                                            15 Dezembro
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MaterialIcon name="location_on" className="text-sm" />
                                            Aula Magna
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MaterialIcon name="payments" className="text-sm" />
                                            12.50€
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Cards */}
                            <div className="flex flex-col gap-8">
                                {secondaryEvents.map((ev) => (
                                    <SecondaryEventCard key={ev.title} {...ev} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ---------------------------------------------------------------- */}
                    {/* Why UTAD FastTicket                                               */}
                    {/* ---------------------------------------------------------------- */}
                    <section className="bg-[#f1f5f9] py-24">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold tracking-tight text-emerald-900 mb-4">
                                    Porquê o UTAD FastTicket?
                                </h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">
                                    Criámos a solução ideal para gerires a tua vida social e
                                    académica sem complicações.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {features.map((f) => (
                                    <FeatureItem key={f.title} {...f} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ---------------------------------------------------------------- */}
                    {/* CTA Banner                                                         */}
                    {/* ---------------------------------------------------------------- */}
                    {!userSession && (
                        <section className="py-20 bg-[#006837] overflow-hidden relative">
                            <div className="absolute inset-0 opacity-10">
                                <MaterialIcon
                                    name="local_activity"
                                    className="text-[300px] absolute -bottom-20 -right-20 text-white"
                                />
                            </div>
                            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="text-white">
                                    <h3 className="text-3xl font-bold mb-4 tracking-tight">
                                        Pronto para a próxima experiência?
                                    </h3>
                                    <p className="text-white/80 text-lg">
                                        Junta-te a milhares de estudantes e não percas nada do que
                                        acontece no campus.
                                    </p>
                                </div>
                                <Link href="/login" className="bg-white text-[#006837] px-10 py-4 rounded-xl font-bold shadow-2xl hover:bg-[#f5f7f8] transition-all active:scale-95 inline-block text-center">
                                    Criar conta agora
                                </Link>
                            </div>
                        </section>
                    )}
                </main>

                {/* ------------------------------------------------------------------ */}
                {/* Footer                                                               */}
                {/* ------------------------------------------------------------------ */}
                <footer className="bg-emerald-950 text-emerald-200/60 py-16">
                    <div className="max-w-7xl mx-auto px-8">
                        {/* Top row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-800 pb-12 mb-12 gap-8">
                            <div className="flex flex-col">
                                <div className="text-lg font-bold text-white uppercase tracking-widest mb-4">
                                    UTAD FastTicket
                                </div>
                                <p className="max-w-sm text-sm">
                                    A plataforma digital oficial para gestão e aquisição de
                                    bilhetes para a comunidade da Universidade de
                                    Trás-os-Montes e Alto Douro.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                {socialLinks.map(({ alt, src }) => (
                                    <Link
                                        key={alt}
                                        href="#"
                                        className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center hover:bg-emerald-800 transition-colors"
                                        aria-label={alt}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={src} alt={alt} width={20} height={20} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Bottom row */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex flex-wrap gap-8">
                                {[
                                    "Privacy Policy",
                                    "Terms of Service",
                                    "Institutional Access",
                                    "Contact Us",
                                ].map((label) => (
                                    <Link
                                        key={label}
                                        href="#"
                                        className="hover:text-white transition-colors hover:underline decoration-emerald-500 underline-offset-4"
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </div>
                            <p className="text-xs tracking-wide">
                                © 2024 UTAD FastTicket. The Digital Atheneum. All rights
                                reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}