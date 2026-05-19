"use client";

import React from 'react';

export default function OrganizerStaff({ eventos }: { eventos: any[] }) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Equipa Staff</h1>
                    <p className="text-sm text-slate-500 mt-1">Gira os membros da equipa que podem fazer check-in nos teus eventos.</p>
                </div>
            </div>

            <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">construction</span>
                <h3 className="text-xl font-bold text-slate-700">Módulo em Construção</h3>
                <p className="text-slate-500 max-w-md mt-2">
                    A gestão detalhada de equipas Staff estará disponível na próxima atualização. 
                    Atualmente, qualquer conta com perfil "Staff" pode verificar bilhetes se autorizada pelo sistema principal.
                </p>
            </div>
        </div>
    );
}
