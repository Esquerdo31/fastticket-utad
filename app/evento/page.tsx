"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventoRootO() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/eventos");
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <p className="text-[#006837] animate-pulse">A redirecionar...</p>
        </div>
    );
}