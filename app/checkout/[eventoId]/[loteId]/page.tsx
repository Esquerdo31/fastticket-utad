"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventoById } from '../../../actions/event';
import { criarSessaoCheckout, simularPagamento } from '../../../actions/pagamento';
import { getActiveSession } from '../../../actions/auth';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();

    const eventoId = Number(params.eventoId);
    const loteId = Number(params.loteId);

    const [evento, setEvento] = useState<any>(null);
    const [lote, setLote] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [errorMsg, setErrorMsg] = useState("");
    const [userSession, setUserSession] = useState<any>(null);

    // Simulate service fees
    const serviceFeePercent = 0.045; // 4.5%
    const universityTax = 0.80;

    useEffect(() => {
        if (typeof window !== 'undefined' && eventoId) {
            const urlParams = new URLSearchParams(window.location.search);
            const ref = urlParams.get('ref');
            if (ref) {
                localStorage.setItem(`promotor_ref_${eventoId}`, ref);
            }
        }

        getActiveSession().then(session => {
            setUserSession(session);
            if (session?.role === "ORGANIZADOR" || session?.role === "STAFF" || session?.role === "ADMIN") {
                setErrorMsg("Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.");
            }
        });

        if (eventoId && loteId) {
            getEventoById(eventoId).then(res => {
                if (res.success && res.data) {
                    setEvento(res.data);
                    const selectedLote = res.data.lotes?.find((l: any) => l.id === loteId);
                    if (selectedLote) {
                        setLote(selectedLote);
                    } else {
                        router.push(`/evento/${eventoId}`);
                    }
                } else {
                    router.push('/eventos');
                }
                setLoading(false);
            });
        }
    }, [eventoId, loteId, router]);

    const handleCheckout = async () => {
        if (!evento || !lote) return;

        if (userSession?.role === "ORGANIZADOR" || userSession?.role === "STAFF" || userSession?.role === "ADMIN") {
            setErrorMsg("Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.");
            return;
        }

        setProcessing(true);
        setErrorMsg("");

        // Obter promotor do URL se existir, com fallback para localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let ref = urlParams.get('ref');
        if (!ref && typeof window !== 'undefined') {
            ref = localStorage.getItem(`promotor_ref_${evento.id}`);
        }

        // Parse price from string like "25.00€" or "Gratuito"
        let basePrice = 0;
        if (lote.price !== "Gratuito") {
            basePrice = parseFloat(lote.price.replace('€', '').trim());
        }

        // Send raw item price, Stripe handles the rest. 
        // We will include fees in the subtotal for visualization, but for stripe we pass the exact subtotal.
        const totalAmount = (basePrice * quantity) + (basePrice > 0 ? (basePrice * quantity * serviceFeePercent) + universityTax : 0);

        const res = await criarSessaoCheckout({
            nomeBilhete: `${evento.title} - ${lote.name}`,
            preco: parseFloat(totalAmount.toFixed(2)),
            quantidade: 1, // We bundle everything into 1 Stripe item to match exact calculated total
            eventoId: evento.id,
            loteId: lote.id,
            // Pass actual quantity to webhook via metadata inside action
            actualQuantity: quantity,
            promotorSlug: ref || undefined
        } as any);

        if (res.success && res.url) {
            window.location.href = res.url;
        } else {
            setErrorMsg(res.message || "Ocorreu um erro ao processar o pagamento.");
            setProcessing(false);
        }
    };

    const handleSimulatePayment = async () => {
        if (!evento || !lote) return;

        if (userSession?.role === "ORGANIZADOR" || userSession?.role === "STAFF" || userSession?.role === "ADMIN") {
            setErrorMsg("Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.");
            return;
        }

        setProcessing(true);
        setErrorMsg("");

        // Obter promotor do URL se existir, com fallback para localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let ref = urlParams.get('ref');
        if (!ref && typeof window !== 'undefined') {
            ref = localStorage.getItem(`promotor_ref_${evento.id}`);
        }

        const res = await simularPagamento({
            eventoId: evento.id,
            loteId: lote.id,
            quantidade: quantity,
            promotorSlug: ref || undefined
        });

        if (res.success) {
            router.push('/dashboard?pagamento=sucesso');
        } else {
            setErrorMsg(res.message || "Ocorreu um erro ao simular o pagamento.");
            setProcessing(false);
        }
    };

    if (loading || !evento || !lote) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-[#006837] font-semibold animate-pulse">A carregar detalhes da encomenda...</p>
            </div>
        );
    }

    let basePrice = 0;
    if (lote.price !== "Gratuito") {
        basePrice = parseFloat(lote.price.replace('€', '').trim());
    }

    const subtotal = basePrice * quantity;
    const isFree = subtotal === 0;
    const serviceFees = isFree ? 0 : subtotal * serviceFeePercent;
    const tax = isFree ? 0 : universityTax;
    const totalAmount = subtotal + serviceFees + tax;

    return (
        <div className="bg-slate-50 font-sans text-slate-800 min-h-screen pb-20">
            {/* Header Secundário */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-[#006837]">
                        UTAD FastTicket
                    </Link>
                    <nav className="flex gap-6 text-sm font-semibold text-slate-500">
                        <Link href="/eventos" className="hover:text-[#006837]">Events</Link>
                        <Link href="/dashboard" className="hover:text-[#006837]">Tickets</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Botão de Voltar */}
                <button
                    onClick={() => router.push(`/evento/${evento.id}`)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm mb-8"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Return to Events
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Coluna Esquerda: Detalhes e Revisão */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Banner "Review Your Order" */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm">
                            <div className="bg-[#006837] sm:w-1/3 p-6 relative overflow-hidden flex flex-col justify-center text-white min-h-[160px]">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/80 mb-2 z-10">Official Portal</span>
                                <h2 className="text-2xl font-bold leading-tight z-10">Secure Academic<br />Checkout</h2>
                            </div>
                            <div className="p-8 flex flex-col justify-center sm:w-2/3">
                                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Verifica a tua Compra</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Por favor verifica a seleção do bilhete. Quando confirmar, será redirecionado para o Stripe para finalizar o pagamento. Bilhetes são guardados por até 10 minutos.
                                </p>
                            </div>
                        </div>

                        {/* Selected Tickets */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Selected Tickets</h3>

                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-100 text-[#006837] rounded-xl flex items-center justify-center font-black text-xl shrink-0">
                                            {lote.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{evento.title}</h4>
                                            <p className="text-slate-500 text-sm">{lote.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                                        <div className="text-xl font-extrabold text-slate-800 mb-2">
                                            {isFree ? 'Gratuito' : `€${basePrice.toFixed(2)}`}
                                        </div>

                                        <div className="flex items-center bg-slate-100 rounded-lg p-1 w-fit">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="w-8 h-8 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-600 transition-all"
                                                disabled={quantity <= 1}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">remove</span>
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                                className="w-8 h-8 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-600 transition-all"
                                                disabled={quantity >= 10 || quantity >= lote.quantidadeDisponivel}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                                <span className="material-symbols-outlined">error</span>
                                <p>{errorMsg}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            <p>Powered by Stripe. Your payment data is never stored on our servers.</p>
                        </div>
                    </div>

                    {/* Coluna Direita: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-[#006837] rounded-2xl shadow-xl shadow-[#006837]/5 overflow-hidden sticky top-28">
                            <div className="bg-[#006837] px-6 py-5">
                                <h3 className="text-white font-bold text-lg">Order Summary</h3>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4 text-sm text-slate-600 border-b border-slate-100 pb-6 mb-6">
                                    <div className="flex justify-between">
                                        <span>Subtotal ({quantity}x)</span>
                                        <span className="font-medium text-slate-800">€{subtotal.toFixed(2)}</span>
                                    </div>
                                    {!isFree && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Service Fees</span>
                                                <span className="font-medium text-slate-800">€{serviceFees.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>University Tax</span>
                                                <span className="font-medium text-slate-800">€{tax.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                                        <div className="text-3xl font-black text-[#006837] leading-none">
                                            €{totalAmount.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">INC. VAT</p>
                                        <p className="text-[10px] bg-emerald-100 text-[#006837] px-2 py-0.5 rounded font-bold mt-1">SECURE PAY</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 flex gap-3 mb-6 border border-slate-100">
                                    <span className="material-symbols-outlined text-[#006837]">verified_user</span>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 mb-0.5">SSL Encrypted Connection</h4>
                                        <p className="text-[10px] text-slate-500 leading-relaxed">Your financial data is handled with institutional-grade security.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={processing || userSession?.role === "ORGANIZADOR" || userSession?.role === "STAFF" || userSession?.role === "ADMIN"}
                                    className={`w-full py-4 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 
                                        ${(processing || userSession?.role === "ORGANIZADOR" || userSession?.role === "STAFF" || userSession?.role === "ADMIN") ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006837] shadow-lg shadow-[#006837]/20 hover:bg-emerald-800'}
                                    `}
                                >
                                    {processing ? 'Processing...' : 'Finalize Purchase'}
                                    {!processing && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                                </button>

                                {/* Botão de Simulação de Pagamento (Apenas em Dev) */}
                                {process.env.NODE_ENV === 'development' && (
                                    <button
                                        onClick={handleSimulatePayment}
                                        disabled={processing || userSession?.role === "ORGANIZADOR" || userSession?.role === "STAFF" || userSession?.role === "ADMIN"}
                                        className="w-full mt-3 py-3 border-2 border-dashed border-violet-500 text-violet-700 hover:bg-violet-50 font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">developer_mode</span>
                                        Simular Pagamento (Teste)
                                    </button>
                                )}

                                <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed">
                                    By clicking Finalize Purchase, you agree to the <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a> of UTAD FastTicket.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
