import Link from "next/link";
import { getWishlistEventos } from "../actions/engagement";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
    const result = await getWishlistEventos();
    const eventos = result.data;

    return (
        <div className="min-h-screen bg-[#f5f7f8] text-[#0f172a]">
            <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-[#006837] hover:opacity-80 transition-opacity">
                        UTAD FastTicket
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/eventos" className="text-sm font-semibold text-slate-600 hover:text-[#006837] transition-colors">
                            Eventos
                        </Link>
                        <Link href="/dashboard" className="text-sm font-bold text-white bg-[#006837] px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
                            Perfil
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-[#006837] mb-2">Favoritos</p>
                        <h1 className="text-4xl font-extrabold tracking-tight">A minha wishlist</h1>
                        <p className="mt-3 text-sm text-slate-500">
                            Eventos que guardaste para voltar a consultar mais tarde.
                        </p>
                    </div>
                    <Link href="/eventos" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-[#006837] hover:text-[#006837] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        Explorar eventos
                    </Link>
                </div>

                {!result.success ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                        <p className="mb-4 text-base font-bold text-slate-800">{result.message}</p>
                        <Link href="/login" className="inline-flex items-center justify-center rounded-lg bg-[#006837] px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition-colors">
                            Iniciar sessao
                        </Link>
                    </div>
                ) : eventos.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                        <p className="text-base font-bold text-slate-800 mb-2">Ainda nao tens eventos guardados</p>
                        <p className="text-sm text-slate-500 mb-6">Quando clicares no coracao de um evento, ele aparece aqui.</p>
                        <Link href="/eventos" className="inline-flex items-center justify-center rounded-lg bg-[#006837] px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition-colors">
                            Ver eventos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {eventos.map((evento) => (
                            <Link
                                key={evento.id}
                                href={`/evento/${evento.id}`}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-lg cursor-pointer"
                            >
                                <div className={`relative flex h-44 items-center justify-center overflow-hidden p-6 text-center ${evento.bannerUrl && evento.mostrarBanner ? "" : "bg-gradient-to-br from-[#0b2818] to-[#006837]"}`}>
                                    {evento.bannerUrl && evento.mostrarBanner && (
                                        <>
                                            <img src={evento.bannerUrl} alt={evento.title} className="absolute inset-0 h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                                        </>
                                    )}
                                    <span className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md">
                                        {evento.category}
                                    </span>
                                    {evento.esgotado && (
                                        <span className="absolute right-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-white">
                                            Esgotado
                                        </span>
                                    )}
                                    <h2 className="relative z-10 text-2xl font-bold text-white drop-shadow-md">{evento.title}</h2>
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-[#006837]">
                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                        {evento.date}
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold leading-tight text-[#0f172a]">{evento.title}</h3>
                                    <p className="mb-6 line-clamp-2 text-sm text-slate-500">{evento.description}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div>
                                            <p className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-[#64748b]">Desde</p>
                                            <p className="text-lg font-extrabold text-[#006837]">{evento.price}</p>
                                        </div>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-[#006837]" aria-hidden="true">
                                            <span className="material-symbols-outlined text-slate-600 transition-colors group-hover:text-white">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
