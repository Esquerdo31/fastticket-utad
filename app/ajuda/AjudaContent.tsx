"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';

export default function AjudaContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState<'geral' | 'participante' | 'organizador'>('geral');

    const faqItems = [
        {
            category: 'participante',
            question: 'Como posso comprar um bilhete?',
            answer: 'Basta explorar os eventos disponíveis na página "Explorar Eventos", selecionar o lote pretendido e clicar em "Comprar". Será redirecionado para um checkout seguro onde poderá efetuar o pagamento via Stripe ou simulação de teste.'
        },
        {
            category: 'participante',
            question: 'Onde encontro o código QR do meu bilhete?',
            answer: 'Após o pagamento, o seu bilhete é emitido instantaneamente. Pode aceder-lhe na sua Área de Utilizador > "Os meus Bilhetes". Apresente o código QR gerado no seu telemóvel à entrada do evento.'
        },
        {
            category: 'participante',
            question: 'O que significa se um evento estiver "Suspenso"?',
            answer: 'A suspensão de um evento é uma medida de segurança temporária. Significa que as vendas e as validações de entradas estão pausadas. Os seus bilhetes continuam registados de forma segura e receberá informações do organizador em caso de reativação ou reembolso.'
        },
        {
            category: 'participante',
            question: 'Como funciona a Wishlist (Favoritos)?',
            answer: 'Pode clicar no ícone de coração nos eventos para guardá-los. Na página "Wishlist", poderá monitorizar os eventos de interesse e removê-los instantaneamente se desejar.'
        },
        {
            category: 'organizador',
            question: 'Como posso criar um evento?',
            answer: 'Se tiver o cargo de Organizador, aceda à sua Dashboard > separador "Criar Evento". O assistente passo-a-passo irá guiá-lo na definição do nome, datas, imagem de banner, lotes de bilhetes e preços.'
        },
        {
            category: 'organizador',
            question: 'Como funciona a validação de bilhetes (Check-in)?',
            answer: 'Os membros da equipa de Staff vinculados ao evento podem aceder à Dashboard de Staff e ativar a câmara do telemóvel diretamente no browser. O leitor integrado descodifica o código QR e valida a entrada de forma instantânea.'
        },
        {
            category: 'organizador',
            question: 'Posso reverter um evento com vendas para rascunho?',
            answer: 'Não. Por questões de integridade financeira e para proteger os bilhetes já adquiridos, um evento com vendas ativas não pode voltar ao estado de rascunho nem ser cancelado diretamente. Em vez disso, deve utilizar a opção de "Suspender" no painel de administração.'
        },
        {
            category: 'organizador',
            question: 'Como posso exportar os relatórios financeiros?',
            answer: 'No separador de "Vendas" da sua Dashboard de Organizador, clique no botão "Exportar CSV" para descarregar uma folha de cálculo com todas as transações, detalhes de compradores e promotores associados.'
        }
    ];

    const filteredFaq = faqItems.filter(item => {
        const matchesQuery = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeSection === 'geral' || item.category === activeSection;
        return matchesQuery && matchesCategory;
    });

    return (
        <div className="bg-[#0d1117] font-sans text-slate-300 antialiased min-h-screen pt-16 flex flex-col justify-between">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-12 flex-grow w-full space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-4 py-6">
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                        Suporte UTAD FastTicket
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Como podemos ajudar?</h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                        Encontre respostas rápidas a dúvidas sobre compras, reembolsos, criação de eventos e validação de acessos.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative pt-4">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 text-slate-400 text-lg">search</span>
                        <input 
                            type="text"
                            placeholder="Pesquise por palavras-chave (ex: QR, reembolso, Stripe)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Categories Tab selector */}
                <div className="flex justify-center gap-2 border-b border-white/5 pb-6">
                    {[
                        { id: 'geral', label: 'Tópicos Gerais', icon: 'help' },
                        { id: 'participante', label: 'Estudantes / Compradores', icon: 'person' },
                        { id: 'organizador', label: 'Organizadores & Staff', icon: 'campaign' }
                    ].map(tab => (
                        <button
                            type="button"
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id as any)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeSection === tab.id 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFaq.length > 0 ? (
                        filteredFaq.map((item, index) => (
                            <div 
                                key={index} 
                                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/15 transition-all space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                        item.category === 'participante' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                    }`}>
                                        {item.category === 'participante' ? 'Participante' : 'Organizador'}
                                    </span>
                                </div>
                                <h3 className="text-white font-extrabold text-base tracking-tight">{item.question}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.answer}</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center text-slate-500 space-y-2">
                            <span className="material-symbols-outlined text-4xl opacity-30">find_in_page</span>
                            <p className="text-sm font-medium">Nenhum artigo encontrado para a sua pesquisa.</p>
                        </div>
                    )}
                </div>

                {/* Help Contacts Footer Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    <div className="p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl space-y-3">
                        <span className="material-symbols-outlined text-emerald-400 text-3xl">mail</span>
                        <h3 className="text-white font-bold text-lg">Apoio ao Estudante</h3>
                        <p className="text-xs text-slate-400">Dúvidas sobre pagamentos, reembolsos ou problemas no acesso aos bilhetes emitidos.</p>
                        <a href="mailto:suporte@fastticket.utad.pt" className="text-emerald-400 font-bold text-sm hover:underline block pt-1">suporte@fastticket.utad.pt</a>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl space-y-3">
                        <span className="material-symbols-outlined text-violet-400 text-3xl">business_center</span>
                        <h3 className="text-white font-bold text-lg">Apoio a Núcleos & Organizadores</h3>
                        <p className="text-xs text-slate-400">Esclarecimentos sobre criação de lotes, comissões de afiliados ou gestão de staff de serviço.</p>
                        <a href="mailto:nucleos@fastticket.utad.pt" className="text-violet-400 font-bold text-sm hover:underline block pt-1">nucleos@fastticket.utad.pt</a>
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
                            <Link href="/eventos" className="hover:text-white transition-colors text-xs font-medium">Explorar Eventos</Link>
                            <Link href="/ajuda" className="hover:text-white transition-colors text-xs font-medium text-white font-bold">Ajuda</Link>
                        </div>
                        <p className="text-xs">© 2026 UTAD FastTicket. Academia Portuguesa.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
