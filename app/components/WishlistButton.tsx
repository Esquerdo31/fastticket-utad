"use client";

import React, { useEffect, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "../actions/engagement";

interface WishlistButtonProps {
    eventoId: number;
    userId?: number;
    initialIsWishlisted: boolean;
}

export default function WishlistButton({ eventoId, userId, initialIsWishlisted }: WishlistButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const [confirmedWishlisted, setConfirmedWishlisted] = useState(initialIsWishlisted);
    const [optimisticWishlisted, setOptimisticWishlisted] = useOptimistic(
        confirmedWishlisted,
        (_currentState, nextState: boolean) => nextState
    );

    useEffect(() => {
        setConfirmedWishlisted(initialIsWishlisted);
    }, [initialIsWishlisted]);

    const handleToggle = () => {
        setMessage("");

        if (!userId) {
            setMessage("Inicia sessao para guardar favoritos.");
            router.push("/login");
            return;
        }

        const previousState = confirmedWishlisted;
        const nextState = !previousState;

        startTransition(async () => {
            setOptimisticWishlisted(nextState);

            try {
                const result = await toggleWishlist(eventoId, userId);

                if (!result.success) {
                    console.error("[WishlistButton] toggleWishlist falhou", result);
                    setConfirmedWishlisted(previousState);
                    setMessage(result.message || "Nao foi possivel atualizar favoritos.");
                    return;
                }

                setConfirmedWishlisted(Boolean(result.isWishlisted));
                router.refresh();
            } catch (error) {
                console.error("[WishlistButton] erro inesperado ao atualizar favoritos", error);
                setConfirmedWishlisted(previousState);
                setMessage("Nao foi possivel atualizar favoritos.");
            }
        });
    };

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                aria-pressed={optimisticWishlisted}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-70 ${
                    optimisticWishlisted
                        ? "border-red-500 bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                }`}
            >
                <span className="inline-flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">
                        {optimisticWishlisted ? "favorite" : "favorite_border"}
                    </span>
                    {optimisticWishlisted ? "Guardado nos Favoritos" : "Adicionar aos Favoritos"}
                </span>
            </button>
            {message && <p className="text-center text-xs font-semibold text-red-600">{message}</p>}
        </div>
    );
}
