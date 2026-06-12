import React from 'react';
import { redirect } from 'next/navigation';
import { getActiveSession } from '@/app/actions/auth';
import prisma from '@/lib/prisma';
import StaffShell from './components/StaffShell';

export const metadata = {
    title: "Painel do Staff - UTAD FastTicket",
    description: "Validar bilhetes e controlar a lotação de eventos em tempo real na plataforma UTAD FastTicket."
};

export default async function StaffDashboardPage() {
    const session = await getActiveSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    if (session.role !== 'STAFF') {
        redirect('/dashboard');
    }

    // Obter os eventos vinculados ao staff
    const staffEvents = await prisma.eventoStaff.findMany({
        where: { staffId: session.userId },
        include: {
            evento: {
                include: {
                    lotes: {
                        include: {
                            bilhetes: {
                                include: {
                                    registosAcesso: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const userName = session.nome || "Staff";

    // Formatar os eventos para passar ao componente
    const eventos = staffEvents.map(se => {
        const ev = se.evento;
        // Contar quantos check-ins já foram feitos (registos de acesso)
        let checkinsCount = 0;
        ev.lotes.forEach(l => {
            l.bilhetes.forEach(b => {
                checkinsCount += b.registosAcesso.length;
            });
        });

        return {
            id: ev.id,
            titulo: ev.titulo,
            dataInicio: ev.dataInicio.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
            localizacao: ev.localizacao,
            lotacaoMaxima: ev.lotacaoMaxima,
            checkinsCount
        };
    });

    const user = {
        id: session.userId,
        nome: userName,
        email: session.email || '',
        role: session.role,
    };

    return (
        <StaffShell
            userName={userName}
            eventos={eventos}
            user={user}
        />
    );
}
