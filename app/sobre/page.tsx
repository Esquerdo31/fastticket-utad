"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
    return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function SobrePage() {
    const router = useRouter();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        // Set page title for SEO client-side
        document.title = "Sobre Nós - UTAD FastTicket";
    }, []);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const socialLinks = [
        { alt: "Facebook", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWaTco4V6jlYxONyqFNccNuNy_xt4_UmPHBPUmK4IF5mDscRR7mcDFY5rfE_jiu5wBa-6EIoYCYiLKbHxUXWeCLmudh4O96uhDxSOFxirPJ7AS5ZHdST-Rlia22drDUk1EBYeM5n_MQE-WEuewwsz7KSSskbbM8f4C3ePWxppUnlBjJQhL9CGylD_I_AsrTcBeUO316Wxm-0FE0vbzlSNskoAkPET__QAH4beVKXN9mimZTK6WCMHuREb1k5ULKhTFFAWHpgTXL9M" },
        { alt: "Instagram", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8lnSHDUuUJuphF4ehXrcUAxAzALbzDw4w-x9pGrf8maZastY6MNd55X82SK1EJUmjMxj150Gcn5SBijW1ZCPLJLqTFVSxtBjiwYD5DEl4AbFDX0gVPpU6C--Haczr_MTqvCaEzQr1gKnffkgm2EirEmCwborsWFGbOO4V0QEoejausS-6403FSdfyCG3yIL6eciAztE74NgQ-EDqdmUMIZs3LuDRtudZ93YrfsBw19OLNiAkwzNI7ef8l-0FsIApjP1i31NqVVNw" },
        { alt: "X", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDovgI6w4MHmPrZzCYMijUivl_BglYlISoclbMy1melCg66fxl0YD73OI3iPogzGE6efqrHkFXWHs3UFAglzXgn1TCTi3XZZmqyvU4uJmWiUcyzYoi2FaAtl05-KafaVWOLTtrnt0u5Bc4C7UrG_BROZv6EJiZFkJbrvdG2gVjCkS018iyr34Guqb65AOXk5AXZWhjF0I7mYCBYX5Qmo8SsD3nabsVAM_Xnf6b_zkdo01mYefA5YmSMTJJb_6M0uDdKkFs4vytBcZQ" },
    ];

    const stats = [
        { value: "100%", label: "Digital & Paperless", desc: "Sem desperdício de papel.", icon: "eco" },
        { value: "< 2s", label: "Check-in Rápido", desc: "Leitura de QR codes instantânea.", icon: "speed" },
        { value: "24/7", label: "Disponibilidade", desc: "Adquire bilhetes a qualquer hora.", icon: "schedule" },
        { value: "0€", label: "Taxa de Registo", desc: "Aderir como organizador é grátis.", icon: "payments" }
    ];

    const pillars = [
        {
            title: "Gestão Descomplicada",
            desc: "Os organizadores e núcleos de estudantes têm controlo total sobre os lotes, preços e lotação dos seus eventos num painel interativo e robusto.",
            icon: "dashboard_customize",
            color: "from-emerald-500/20 to-teal-500/5"
        },
        {
            title: "Bilhetes Inteligentes",
            desc: "Bilhetes associados à conta do estudante, com validação inteligente para garantir a máxima segurança e prevenir a duplicação ou falsificação.",
            icon: "qr_code_2",
            color: "from-blue-500/20 to-emerald-500/5"
        },
        {
            title: "Rede de Promotores",
            desc: "Uma solução transparente para comissões e acompanhamento de vendas em tempo real, potenciando a divulgação de cada evento de forma orgânica.",
            icon: "campaign",
            color: "from-purple-500/20 to-pink-500/5"
        },
        {
            title: "Análise Avançada",
            desc: "Dados consolidados sobre receitas, perfis de participantes e evolução diária das vendas para ajudar a planear futuros eventos com precisão.",
            icon: "insights",
            color: "from-amber-500/20 to-orange-500/5"
        }
    ];

    const faqs = [
        {
            q: "O que é o UTAD FastTicket?",
            a: "O UTAD FastTicket é uma plataforma digital desenvolvida especialmente para simplificar a criação, promoção, venda e gestão de bilhetes para eventos na comunidade académica da Universidade de Trás-os-Montes e Alto Douro (UTAD)."
        },
        {
            q: "Quem pode criar eventos na plataforma?",
            a: "Qualquer entidade académica registada, incluindo a Associação Académica da UTAD (A.A.UTAD), Núcleos de Estudantes, comissões de curso e organizadores autónomos autorizados."
        },
        {
            q: "Como funciona o check-in no dia do evento?",
            a: "No dia do evento, basta apresentar o QR Code do seu bilhete no telemóvel. O staff da organização utilizará a nossa ferramenta de digitalização integrada para validar a sua entrada em menos de 2 segundos."
        },
        {
            q: "Sou promotor, como recebo as minhas comissões?",
            a: "Ao partilhar o seu link ou código de promotor exclusivo, as vendas são associadas à sua conta em tempo real. O dashboard de organizador calcula automaticamente a sua comissão acumulada."
        },
        {
            q: "O processo de compra é seguro?",
            a: "Sim, absolutamente. Todas as transações e emissões de bilhetes são processadas com protocolos de segurança modernos, associando cada bilhete de forma única e intransmissível ao utilizador final."
        }
    ];

    return (
        <>
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    font-family: 'Material Symbols Outlined';
                }
            `}</style>

            <div className="bg-[#0d1117] font-sans text-slate-200 antialiased min-h-screen flex flex-col justify-between pt-16">
                <Header />

                <main className="flex-grow">
                    {/* Hero Section */}
                    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#081e13] via-[#0d1117] to-[#0d1117]">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
                        
                        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 mb-6">
                                <MaterialIcon name="info" className="text-xs" /> O Nosso Projeto
                            </span>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                                A revolução dos eventos na <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">UTAD</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
                                O UTAD FastTicket nasceu para simplificar a forma como os estudantes vivem a academia. Bilheteira digital rápida, segura, ecológica e à distância de um clique.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/eventos" className="bg-[#006837] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-950/40 flex items-center gap-2">
                                    Explorar Eventos <MaterialIcon name="explore" className="text-lg" />
                                </Link>
                                <a href="#faqs" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2">
                                    Saber Mais <MaterialIcon name="arrow_downward" className="text-lg" />
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Stats Grid */}
                    <section className="py-12 border-y border-white/5 bg-[#161b22]/30">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="flex flex-col items-center lg:items-start text-center lg:text-left p-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
                                            <MaterialIcon name={stat.icon} className="text-2xl" />
                                        </div>
                                        <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                                        <div className="text-sm font-semibold text-emerald-400 mb-1">{stat.label}</div>
                                        <div className="text-xs text-slate-400">{stat.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Pillars / Features */}
                    <section className="py-20 max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-white tracking-tight">O que nos torna únicos?</h2>
                            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">Desenvolvido com foco nas necessidades reais da nossa comunidade académica.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {pillars.map((p, idx) => (
                                <div key={idx} className="group relative bg-[#161b22]/50 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-8 transition-all hover:-translate-y-1 shadow-lg overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${p.color} blur-2xl opacity-40 group-hover:opacity-75 transition-opacity`} />
                                    <div className="relative z-10 flex gap-5">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                            <MaterialIcon name={p.icon} className="text-2xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{p.title}</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Academic Alignment Section */}
                    <section className="py-20 bg-gradient-to-t from-[#161b22]/40 to-[#0d1117]">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="bg-gradient-to-r from-emerald-950/20 via-[#161b22] to-slate-900/20 border border-white/5 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1">
                                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 block">Ligados à UTAD</span>
                                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Criado por e para Estudantes</h2>
                                    <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                                        Sabemos como a vida académica em Vila Real é vibrante. O UTAD FastTicket foi desenhado para apoiar a organização dos eventos que marcam os teus anos de faculdade, desde a mítica Semana Académica às garraiadas, jantares de curso e palestras de engenharia.
                                    </p>
                                    <ul className="space-y-3 text-slate-300 text-sm">
                                        <li className="flex items-start gap-2.5">
                                            <MaterialIcon name="check_circle" className="text-emerald-400 text-lg flex-shrink-0 mt-0.5" />
                                            <span>Facilidade na venda de bilhetes físicos e digitais em simultâneo.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <MaterialIcon name="check_circle" className="text-emerald-400 text-lg flex-shrink-0 mt-0.5" />
                                            <span>Integração simples de equipas de promotores de curso.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <MaterialIcon name="check_circle" className="text-emerald-400 text-lg flex-shrink-0 mt-0.5" />
                                            <span>Eliminação de bilhetes duplicados e problemas no check-in do evento.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="w-full md:w-1/3 flex justify-center">
                                    <div className="relative p-6 bg-white/5 border border-white/10 rounded-2xl text-center max-w-[280px]">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-4 border border-emerald-500/20">
                                            <MaterialIcon name="school" className="text-3xl" />
                                        </div>
                                        <h4 className="text-white font-bold mb-1 text-base">Alinhado com a Academia</h4>
                                        <p className="text-xs text-slate-400 leading-normal">
                                            Uma solução moderna, ecológica e eficiente adaptada às especificidades do ecossistema estudantil da UTAD.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Accordion Section */}
                    <section id="faqs" className="py-20 max-w-4xl mx-auto px-6 scroll-mt-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Perguntas Frequentes</h2>
                            <p className="text-slate-400 text-sm mt-2">Esclarece as tuas dúvidas sobre o funcionamento do UTAD FastTicket.</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-[#161b22]/50 border border-white/5 rounded-xl overflow-hidden transition-colors duration-200"
                                >
                                    <button 
                                        onClick={() => toggleFaq(idx)} 
                                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors focus:outline-none"
                                        id={`faq-btn-${idx}`}
                                    >
                                        <span className="font-semibold text-white text-base pr-4">{faq.q}</span>
                                        <MaterialIcon 
                                            name={activeFaq === idx ? "remove_circle" : "add_circle"} 
                                            className={`text-emerald-400 transition-transform duration-300`} 
                                        />
                                    </button>
                                    
                                    <div 
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            activeFaq === idx ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <div className="px-6 pb-6 pt-1 text-slate-400 text-sm leading-relaxed border-t border-white/5">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="py-16 max-w-7xl mx-auto px-6 mb-12">
                        <div className="bg-gradient-to-br from-[#09351c] to-[#161b22] border border-emerald-500/20 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Pronto para começar?</h2>
                            <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                                Regista-te já para explorares os eventos disponíveis ou cria a tua conta de organizador para colocares à venda os bilhetes para a tua próxima festa académica.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 relative z-10">
                                <Link href="/registar" className="bg-white text-emerald-950 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg">
                                    Criar Conta Estudante
                                </Link>
                                <Link href="/login" className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-bold transition-all">
                                    Entrar como Organizador
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-[#080c14] text-slate-500 py-12 border-t border-white/5 w-full">
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
