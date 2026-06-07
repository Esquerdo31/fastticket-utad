"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getActiveSession, logoutUser } from "./actions/auth";
import { getEventos } from "./actions/event";
import { getEventStatus } from "@/lib/eventStatus";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
    return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function UTADFastTicketPage() {
    const router = useRouter();
    const [userSession, setUserSession] = useState<any>(null);
    const [dbEvents, setDbEvents] = useState<any[]>([]);
    const [heroIdx, setHeroIdx] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getActiveSession().then(setUserSession);
        getEventos().then(res => {
            if (res.success && res.data) {
                const activeEvents = res.data.filter((ev: any) => {
                    const status = getEventStatus({
                        estado: ev.estado,
                        dataInicio: ev.dataInicio,
                        dataFim: ev.dataFim,
                        lotes: ev.lotes
                    });
                    return status !== 'TERMINADO' && status !== 'RASCUNHO' && status !== 'CANCELADO';
                });
                setDbEvents(activeEvents);
            }
        });
    }, []);

    // Preload all banner images
    useEffect(() => {
        dbEvents.forEach((ev, i) => {
            if (ev.bannerUrl) {
                const img = new Image();
                img.onload = () => setImagesLoaded(prev => new Set(prev).add(i));
                img.src = ev.bannerUrl;
            }
        });
    }, [dbEvents]);

    const handleLogout = async () => {
        await logoutUser();
        setUserSession(null);
    };

    // Auto-advance hero
    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (dbEvents.length <= 1) return;
        timerRef.current = setInterval(() => {
            setHeroIdx(prev => (prev + 1) % dbEvents.length);
        }, 6000);
    }, [dbEvents.length]);

    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [resetTimer]);

    const goToHero = (i: number) => { setHeroIdx(i); resetTimer(); };

    const heroEvent = dbEvents[heroIdx];

    const socialLinks = [
        { alt: "Facebook", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWaTco4V6jlYxONyqFNccNuNy_xt4_UmPHBPUmK4IF5mDscRR7mcDFY5rfE_jiu5wBa-6EIoYCYiLKbHxUXWeCLmudh4O96uhDxSOFxirPJ7AS5ZHdST-Rlia22drDUk1EBYeM5n_MQE-WEuewwsz7KSSskbbM8f4C3ePWxppUnlBjJQhL9CGylD_I_AsrTcBeUO316Wxm-0FE0vbzlSNskoAkPET__QAH4beVKXN9mimZTK6WCMHuREb1k5ULKhTFFAWHpgTXL9M" },
        { alt: "Instagram", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8lnSHDUuUJuphF4ehXrcUAxAzALbzDw4w-x9pGrf8maZastY6MNd55X82SK1EJUmjMxj150Gcn5SBijW1ZCPLJLqTFVSxtBjiwYD5DEl4AbFDX0gVPpU6C--Haczr_MTqvCaEzQr1gKnffkgm2EirEmCwborsWFGbOO4V0QEoejausS-6403FSdfyCG3yIL6eciAztE74NgQ-EDqdmUMIZs3LuDRtudZ93YrfsBw19OLNiAkwzNI7ef8l-0FsIApjP1i31NqVVNw" },
        { alt: "X", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDovgI6w4MHmPrZzCYMijUivl_BglYlISoclbMy1melCg66fxl0YD73OI3iPogzGE6efqrHkFXWHs3UFAglzXgn1TCTi3XZZmqyvU4uJmWiUcyzYoi2FaAtl05-KafaVWOLTtrnt0u5Bc4C7UrG_BROZv6EJiZFkJbrvdG2gVjCkS018iyr34Guqb65AOXk5AXZWhjF0I7mYCBYX5Qmo8SsD3nabsVAM_Xnf6b_zkdo01mYefA5YmSMTJJb_6M0uDdKkFs4vytBcZQ" },
    ];

    // Carousel scroll helpers
    const scrollCarousel = (dir: 'left' | 'right') => {
        if (!carouselRef.current) return;
        const w = carouselRef.current.offsetWidth * 0.6;
        carouselRef.current.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' });
    };

    return (
        <>
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    font-family: 'Material Symbols Outlined';
                }
                .carousel-scroll { scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
                .carousel-scroll::-webkit-scrollbar { display: none; }
                .carousel-card { scroll-snap-align: center; }
                @keyframes heroProgress { from { width: 0%; } to { width: 100%; } }
                .hero-progress { animation: heroProgress 6s linear; }
            `}</style>

            <div className="bg-[#0d1117] font-sans text-slate-800 antialiased min-h-screen">
                {/* Header */}
                <header className="bg-[#161b22]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                    <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-2xl font-bold tracking-tighter text-white hover:text-emerald-400 transition-colors">
                                UTAD FastTicket
                            </Link>
                            <nav className="hidden md:flex gap-6">
                                <Link href="/eventos" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Explorar</Link>
                                <Link href="/sobre" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sobre</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            {userSession ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/dashboard" className="text-sm font-bold text-white bg-[#006837] px-4 py-2 rounded-lg whitespace-nowrap shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-2">
                                        <MaterialIcon name="person" className="text-sm" />
                                        {userSession.nome || userSession.email.split("@")[0]}
                                    </Link>
                                    <button onClick={handleLogout} className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">Sair</button>
                                </div>
                            ) : (
                                <Link href="/login" className="bg-[#006837] text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-[#006837]/20 hover:bg-emerald-700 active:scale-95 transition-all">Sign In</Link>
                            )}
                        </div>
                    </div>
                </header>

                <main>
                    {/* Hero — Clean background with text overlay, NO flash */}
                    <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
                        {/* All backgrounds rendered, only active one visible */}
                        {dbEvents.map((ev, i) => (
                            <div key={ev.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
                                {ev.bannerUrl && imagesLoaded.has(i) ? (
                                    <>
                                        <img src={ev.bannerUrl} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/90 via-[#0d1117]/60 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-[#0d1117]/30" />
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#0b2818] via-[#004d29] to-[#006837]">
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {dbEvents.length === 0 && (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0b2818] via-[#004d29] to-[#006837]">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
                            </div>
                        )}

                        {/* Hero content */}
                        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
                            {heroEvent ? (
                                <div className="max-w-xl">
                                    <span className="inline-block bg-emerald-500/20 backdrop-blur text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-400/20 mb-4">
                                        Em destaque
                                    </span>
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 drop-shadow-lg">
                                        {heroEvent.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-5 text-white/70 mb-6 text-sm">
                                        <span className="flex items-center gap-1.5"><MaterialIcon name="calendar_today" className="text-emerald-400 text-base" />{heroEvent.date}</span>
                                        <span className="flex items-center gap-1.5"><MaterialIcon name="location_on" className="text-emerald-400 text-base" />{heroEvent.location}</span>
                                        <span className="flex items-center gap-1.5 text-emerald-300 font-bold"><MaterialIcon name="local_activity" className="text-base" />{heroEvent.price}</span>
                                    </div>
                                    <Link href={`/evento/${heroEvent.id}`} className="inline-flex items-center gap-2 bg-[#006837] text-white px-7 py-3.5 rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-900/30">
                                        Comprar Bilhete <MaterialIcon name="arrow_forward" className="text-lg" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="max-w-xl">
                                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">Os melhores eventos da academia</h1>
                                    <p className="text-lg text-white/70 mb-6">Descobre festas, palestras, competições e workshops para a comunidade UTAD.</p>
                                    <Link href="/eventos" className="inline-flex items-center gap-2 bg-white text-[#006837] px-7 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-all">
                                        Explorar Agenda <MaterialIcon name="arrow_forward" />
                                    </Link>
                                </div>
                            )}

                            {/* Hero dots */}
                            {dbEvents.length > 1 && (
                                <div className="flex items-center gap-2 mt-8">
                                    {dbEvents.map((_, i) => (
                                        <button key={i} onClick={() => goToHero(i)} className="relative h-1 rounded-full overflow-hidden transition-all" style={{ width: i === heroIdx ? 40 : 10 }}>
                                            <div className={`absolute inset-0 rounded-full ${i === heroIdx ? 'bg-white/30' : 'bg-white/15 hover:bg-white/25'}`} />
                                            {i === heroIdx && <div className="absolute inset-0 rounded-full bg-emerald-400 hero-progress" key={`hp-${heroIdx}`} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Novidades — Card Carousel (MEO Blueticket style) */}
                    {dbEvents.length > 0 && (
                        <section className="py-12 relative">
                            <div className="max-w-7xl mx-auto px-6 mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Novidades</h2>
                                    <p className="text-slate-500 text-sm mt-1">Os eventos mais recentes na plataforma</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => scrollCarousel('left')} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all">
                                        <MaterialIcon name="chevron_left" className="text-xl" />
                                    </button>
                                    <button onClick={() => scrollCarousel('right')} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all">
                                        <MaterialIcon name="chevron_right" className="text-xl" />
                                    </button>
                                    <Link href="/eventos" className="ml-2 text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors flex items-center gap-1">
                                        Ver todos <MaterialIcon name="arrow_forward" className="text-base" />
                                    </Link>
                                </div>
                            </div>

                            <div ref={carouselRef} className="carousel-scroll flex gap-4 overflow-x-auto px-6 pb-4" style={{ paddingLeft: 'max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))' }}>
                                {dbEvents.map((ev) => (
                                    <Link href={`/evento/${ev.id}`} key={ev.id} className="carousel-card group flex-shrink-0 w-[220px] md:w-[260px]">
                                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-[#1c2333] border border-white/5 group-hover:border-emerald-500/30 transition-all group-hover:shadow-xl group-hover:shadow-emerald-500/5">
                                            {ev.bannerUrl || ev.thumbnailUrl ? (
                                                <img src={ev.thumbnailUrl || ev.bannerUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#0b2818] to-[#006837] flex items-center justify-center p-4">
                                                    <h3 className="text-white font-bold text-center text-lg drop-shadow">{ev.title}</h3>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                <span className="bg-[#006837] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">Ver evento</span>
                                            </div>
                                        </div>
                                        <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-emerald-400 transition-colors leading-tight">{ev.title}</h3>
                                        <p className="text-slate-500 text-xs">{ev.date}</p>
                                        <p className="text-slate-600 text-xs">{ev.location}</p>
                                    </Link>
                                ))}
                                {/* Spacer to allow last card to be visible */}
                                <div className="flex-shrink-0 w-6" />
                            </div>
                        </section>
                    )}
                </main>

                {/* Footer */}
                <footer className="bg-[#080c14] text-slate-500 py-12 border-t border-white/5 mt-8">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 mb-8 gap-6">
                            <div>
                                <div className="text-lg font-bold text-white uppercase tracking-widest mb-2">UTAD FastTicket</div>
                                <p className="max-w-sm text-sm">A plataforma digital oficial para gestão e aquisição de bilhetes para a comunidade de Vila Real.</p>
                            </div>
                            <div className="flex gap-3">
                                {socialLinks.map(({ alt, src }) => (
                                    <Link key={alt} href="#" className="w-9 h-9 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" aria-label={alt}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={src} alt={alt} width={18} height={18} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-wrap gap-6">
                                {["Política de Privacidade", "Termos de Serviço", "Acesso Institucional"].map((label) => (
                                    <Link key={label} href="#" className="hover:text-white transition-colors text-xs font-medium">{label}</Link>
                                ))}
                            </div>
                            <p className="text-xs">© 2026 UTAD FastTicket. Academia Portuguesa.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}