import React, { useState } from 'react';

const EventDetails = () => {
    // --- Estados ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState('geral');

    // --- Dados de Exemplo ---
    const speakers = [
        {
            id: 1,
            name: "Dr. João Silva",
            role: "Diretor de IA, TechCorp",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_veI7xbU8gCbFr9il_TgoNAmGzEpoEUjq8dMuXf6m2KoUejXAYNx26OAgLJ9TBX5sbEhl4SC5LDL7X3lc107gzs8y5ErCbqwY45shaDd-UIRZzFW6QbdEIRZTcu5o8sOKZfiTixkbhwCH8ExL3NDAEm_LQnvMlB_NprTOJ4lAbrfqZGlIJjj-1DTf291CDJW2CaUuFPGAw05z4TMPIAqoNNZBtzuSYts5oCYN2LBbXGu4DlLqFsiFeTp06roKJ1uXXObIQYrBcj8"
        },
        {
            id: 2,
            name: "Dra. Ana Martins",
            role: "Investigadora Principal, UTAD",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBIOo6wWB6SDr13VXX4KFYTEoDZJmRp5hdEYKm4SCI27N1nb1LY9IGznJX61Nj4tteD1GmlZnRK38Msx5UIJUQL_Q52Kj1XPwrwNyxESnqDVqV43fbn_-9gvr_Hk8OYa2xLZAYwWu52gmMfi09d5u5WMLmBDkkgmxElJwikb7lXzsCsZV2yLGYHnNCn0JoxfdkBYQWu3FTnq7rJY-WskUKuzwF_-gKOlLTgtHRrYktKnc5xqeyLlfqLJyr9YuiGGtxhyNXHZuMlCw"
        },
        {
            id: 3,
            name: "Eng. Pedro Santos",
            role: "CTO, CloudScale",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1RqiuO90AZH8wxerV7fGxSbWF1-QOP_2_YDkqn0Y2aU6IQtvaCCBYA6XevZgyGmYFZPxPR2Fl446FAea82yymrM7GOGt2BaJi71D83LeSyAqBZjfHmTB9DD0PaIdq6dYDOfKqabgybsdpkZedyFymbadZXxZDTYAwFJuYy3r0RAu5TqdIUpneW93TmM42c-JRDJd-B3isziXxFeeN4QvrBEEvhV1Zo3Zq5ofqja21KFeJ1Q1mMfA-DnlBFHi_vpDYgEUNh9ORrQ0"
        }
    ];

    const tickets = [
        {
            id: 'geral',
            name: 'Bilhete Geral',
            desc: 'Acesso total às palestras',
            price: '25,00€'
        },
        {
            id: 'vip',
            name: 'VIP Experience',
            desc: 'Networking + Almoço',
            price: '65,00€'
        },
        {
            id: 'estudante',
            name: 'Estudante UTAD',
            desc: 'Necessário Cartão UTAD',
            price: '10,00€'
        }
    ];

    return (
        <div className="bg-surface-dim font-body text-on-surface min-h-screen">
            {/* TopAppBar */}
            <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm docked full-width top-0 sticky z-50 font-inter antialiased tracking-tight">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-bold tracking-tighter text-emerald-900 dark:text-emerald-50">
                            UTAD FastTicket
                        </span>
                        <nav className="hidden md:flex gap-6">
                            <a href="#" className="text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-700 dark:border-emerald-300 pb-1 font-semibold">Events</a>
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors">About</a>
                            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors">Support</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm w-64 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="px-5 py-2 text-primary font-medium rounded-lg border border-primary hover:bg-primary/5 active:scale-95 duration-200 transition-all">
                            Registar
                        </button>
                        <button className="px-5 py-2 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary-container active:scale-95 duration-200 transition-all shadow-md">
                            Entrar
                        </button>
                    </div>
                </div>
            </header>

            <main className="min-h-screen">
                {/* Event Banner Section */}
                <section className="relative h-[614px] min-h-[450px] w-full overflow-hidden">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6uWgHQGjXSFWWwK-sGUy3RrK678Ixs0URsWb-YWUpuX8q0ZJmI7JzYb64cIWUXJim-CIC2dLvOBvkt8tco0gczVqzChDD93jylQkE_BR2XUa3PBMzOrn_pNUWolroilp_9VVmvlxFdoSQKyK4OcuRbGsx49EHyvbCJ4AdBIvfJGUmT3OW5g20ZGf_LBcaEJ4ztMHVZYHS7C5rgEx27C6sNHk5tY4VRp1HV_R8CbblhuvxCJGfmGmWHNN9ziygHQPQW3xRbRG91g"
                        alt="Conferência Académica"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Equivalent to .emerald-veil class */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00683773] to-[#006837E6]"></div>

                    <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12">
                        <div className="max-w-3xl">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase mb-4 rounded">
                                Congresso Internacional
                            </span>
                            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                                Simpósio de Inovação Digital 2024
                            </h1>
                            <div className="flex flex-wrap gap-6 text-emerald-50/90 font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">calendar_today</span>
                                    <span>15 de Novembro, 2024</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">schedule</span>
                                    <span>09:00 - 18:30</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">location_on</span>
                                    <span>Aula Magna, UTAD - Vila Real</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Main Column (Left) */}
                        <article className="lg:col-span-8 space-y-12">
                            {/* Description */}
                            <section className="bg-surface p-8 rounded-xl shadow-sm border-l-4 border-primary">
                                <h2 className="text-2xl font-bold mb-6 text-on-surface">Sobre o Evento</h2>
                                <div className="prose prose-emerald max-w-none text-on-surface-variant leading-relaxed space-y-4">
                                    <p>O Simpósio de Inovação Digital 2024 reúne as mentes mais brilhantes da academia e da indústria para discutir o futuro das tecnologias emergentes no ensino superior e na governança pública.</p>
                                    <p>Este ano, focaremos em três eixos fundamentais: Inteligência Artificial Ética, Cibersegurança Institucional e a Digitalização dos Campi Universitários. O evento contará com sessões plenárias, workshops práticos e uma zona de networking dedicada a parcerias estratégicas.</p>
                                    <p>Participe nesta jornada de descoberta e ajude a moldar o ecossistema tecnológico da nossa região.</p>
                                </div>
                            </section>

                            {/* Speakers / Artists */}
                            <section>
                                <h2 className="text-2xl font-bold mb-8 text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">groups</span>
                                    Oradores Convidados
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {speakers.map((speaker) => (
                                        <div key={speaker.id} className="bg-surface rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-outline-variant/30">
                                            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/20">
                                                <img
                                                    src={speaker.image}
                                                    alt={speaker.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="font-bold text-lg">{speaker.name}</h3>
                                            <p className="text-sm text-primary font-medium">{speaker.role}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Location & Map */}
                            <section>
                                <h2 className="text-2xl font-bold mb-6 text-on-surface">Localização</h2>
                                <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant">
                                    <div className="p-4 bg-surface-container flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary">map</span>
                                            <span className="font-medium">Aula Magna, Campus da UTAD</span>
                                        </div>
                                        <a href="#" className="text-primary text-sm font-semibold hover:underline">Abrir no Maps</a>
                                    </div>
                                    <div className="h-80 w-full bg-surface-container-high relative">
                                        <img
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-REcGiCs_YMLqqy3mJs737C3E9XfqqKeTC_IDFsAE3iBbnjZmhO1Li5yaqp5mtKRvSGEKOIkqprby63u3EgpVO5ylLvXvPlrP6FSz3bOpbwaJH1TyKNrRH9iI38z3ABMWKSkGqgsCDCxQ_mvnUTpceZZnnTvsVCEXPsUuyjmBU9n52_KPfXVqHIH4ZN_08p_5cGxnhVGs8ltpVgrXkTkBNFCUJzDoj9mQslBTbA5YODGuLT8MvTFIV9i4aXMMqmVAek1NFQvU2yk"
                                            alt="Localização UTAD"
                                            className="w-full h-full object-cover opacity-60 grayscale"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-primary text-white p-3 rounded-full shadow-lg">
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                                                    location_on
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Additional Info */}
                            <section className="grid md:grid-cols-2 gap-8 pt-8 border-t border-outline-variant">
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">Organização</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center text-white font-bold">UT</div>
                                        <div>
                                            <p className="font-semibold">Reitoria da UTAD</p>
                                            <p className="text-xs text-on-surface-variant">Gabinete de Relações Públicas</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">Política de Cancelamento</h4>
                                    <p className="text-sm text-on-surface-variant leading-relaxed">
                                        Cancelamentos permitidos até 48h antes do evento com reembolso total. Taxas de processamento não reembolsáveis.
                                    </p>
                                </div>
                            </section>
                        </article>

                        {/* Sidebar Column (Right - Sticky) */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-28 space-y-6">

                                {/* Purchase Card */}
                                <div className="bg-surface rounded-xl shadow-xl border border-primary/10 overflow-hidden">
                                    <div className="p-6 bg-primary text-on-primary">
                                        <h3 className="text-xl font-bold">Garantir Bilhete</h3>
                                        <p className="text-emerald-100/80 text-sm">Selecione o seu lote abaixo</p>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {tickets.map((ticket) => {
                                            const isSelected = selectedTicket === ticket.id;
                                            return (
                                                <label
                                                    key={ticket.id}
                                                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                            ? 'border-primary bg-emerald-50/30'
                                                            : 'border-outline-variant hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name="ticket"
                                                                className="text-primary focus:ring-primary h-4 w-4"
                                                                checked={isSelected}
                                                                onChange={() => setSelectedTicket(ticket.id)}
                                                            />
                                                            <div>
                                                                <p className="font-bold">{ticket.name}</p>
                                                                <p className="text-xs text-on-surface-variant">{ticket.desc}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-xl font-extrabold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                                                            {ticket.price}
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}

                                        {/* Availability Indicator */}
                                        <div className="pt-4 border-t border-outline-variant mt-2">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-on-surface-variant">Lotação Restante</span>
                                                <span className="font-bold text-error">Apenas 12 bilhetes!</span>
                                            </div>
                                            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                                                <div className="h-full bg-error rounded-full w-[94%]"></div>
                                            </div>
                                        </div>

                                        <button className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
                                            Comprar Agora
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </button>

                                        <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-tighter mt-3">
                                            Pagamento seguro via SIBS / Multibanco / MBWay
                                        </p>
                                    </div>
                                </div>

                                {/* Share / Info Card */}
                                <div className="bg-surface-container p-6 rounded-xl border border-outline-variant space-y-4">
                                    <h4 className="font-bold text-sm">Partilhar este evento</h4>
                                    <div className="flex gap-2">
                                        <button className="flex-1 p-2 bg-white rounded border border-outline-variant hover:bg-surface-container-high transition-colors">
                                            <span className="material-symbols-outlined text-secondary">share</span>
                                        </button>
                                        <button className="flex-1 p-2 bg-white rounded border border-outline-variant hover:bg-surface-container-high transition-colors">
                                            <span className="material-symbols-outlined text-secondary">mail</span>
                                        </button>
                                        <button className="flex-1 p-2 bg-white rounded border border-outline-variant hover:bg-surface-container-high transition-colors">
                                            <span className="material-symbols-outlined text-secondary">link</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-emerald-950 dark:bg-black w-full border-t border-emerald-800 dark:border-emerald-900 py-12 px-8 font-inter tracking-wide text-sm mt-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <span className="text-lg font-bold text-white uppercase tracking-widest">UTAD FastTicket</span>
                        <p className="text-emerald-200/60 text-center md:text-left max-w-xs">
                            © 2024 UTAD FastTicket. The Digital Atheneum. All rights reserved.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                        <a href="#" className="text-emerald-200/60 hover:text-white hover:underline decoration-emerald-500 underline-offset-4 transition-colors duration-300">Privacy Policy</a>
                        <a href="#" className="text-emerald-200/60 hover:text-white hover:underline decoration-emerald-500 underline-offset-4 transition-colors duration-300">Terms of Service</a>
                        <a href="#" className="text-emerald-200/60 hover:text-white hover:underline decoration-emerald-500 underline-offset-4 transition-colors duration-300">Institutional Access</a>
                        <a href="#" className="text-emerald-200/60 hover:text-white hover:underline decoration-emerald-500 underline-offset-4 transition-colors duration-300">Contact Us</a>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-emerald-400 material-symbols-outlined opacity-80 hover:opacity-100 cursor-pointer">language</span>
                        <span className="text-emerald-400 material-symbols-outlined opacity-80 hover:opacity-100 cursor-pointer">verified_user</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default EventDetails;