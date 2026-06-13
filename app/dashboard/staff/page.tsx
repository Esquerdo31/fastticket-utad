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

    if (session.role !== 'STAFF' && session.role !== 'ORGANIZADOR') {
        redirect('/dashboard');
    }

    // Obter os eventos vinculados ao staff ou ao organizador
    let staffEvents: any[] = [];
    if (session.role === 'STAFF') {
        staffEvents = await prisma.eventoStaff.findMany({
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
    } else if (session.role === 'ORGANIZADOR') {
        const organizerEvents = await prisma.evento.findMany({
            where: { organizadorId: session.userId },
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
        });
        staffEvents = organizerEvents.map(ev => ({
            evento: ev
        }));
    }

    const userName = session.nome || (session.role === 'ORGANIZADOR' ? "Organizador" : "Staff");

    // Formatar os eventos para passar ao componente
    const eventos = staffEvents.map((se: any) => {
        const ev = se.evento;
        // Contar quantos check-ins já foram feitos (registos de acesso)
        let checkinsCount = 0;
        ev.lotes.forEach((l: any) => {
            l.bilhetes.forEach((b: any) => {
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
