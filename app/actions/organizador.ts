"use server";

import prisma from "../../lib/prisma";
import * as bcrypt from "bcryptjs";
import { getSession } from "../../lib/session";

export async function getOrganizerDashboardData(userId: number) {
    try {
        const eventos = await prisma.evento.findMany({
            where: { organizadorId: userId },
            include: {
                lotes: {
                    include: {
                        bilhetes: {
                            where: { estado: 'PAGO' }
                        }
                    }
                }
            },
            orderBy: { dataInicio: 'asc' }
        });

        let totalBilhetesVendidos = 0;
        let receitaTotal = 0;
        
        const eventosStats = eventos.map(evento => {
            let eventoBilhetesVendidos = 0;
            let eventoReceita = 0;
            
            evento.lotes.forEach(lote => {
                const vendidos = lote.bilhetes.length;
                eventoBilhetesVendidos += vendidos;
                eventoReceita += vendidos * lote.preco;
            });
            
            totalBilhetesVendidos += eventoBilhetesVendidos;
            receitaTotal += eventoReceita;
            
            return {
                id: evento.id,
                titulo: evento.titulo,
                dataInicio: evento.dataInicio.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                localizacao: evento.localizacao,
                lotacaoMaxima: evento.lotacaoMaxima,
                bilhetesVendidos: eventoBilhetesVendidos,
                receita: eventoReceita
            };
        });

        const nextEvents = eventosStats.filter(e => {
            const ev = eventos.find(ex => ex.id === e.id);
            return ev && ev.dataInicio >= new Date();
        }).slice(0, 3);

        return {
            success: true,
            summary: {
                totalEventos: eventos.length,
                totalBilhetesVendidos,
                receitaTotal
            },
            eventos: eventosStats,
            nextEvents
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function criarStaff(data: {
    nome: string;
    email: string;
    passwordField: string;
    eventoId: number;
}) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        // Verificar se o organizador é dono do evento
        const evento = await prisma.evento.findFirst({
            where: { id: data.eventoId, organizadorId: session.userId }
        });
        if (!evento) {
            return { success: false, message: 'Evento não encontrado ou não pertence a esta conta.' };
        }

        // Verificar se utilizador com este email já existe
        let user = await prisma.utilizador.findUnique({
            where: { email: data.email }
        });

        if (user) {
            if (user.role !== 'STAFF') {
                return { success: false, message: 'Este e-mail pertence a um utilizador que não é do tipo Staff.' };
            }
        } else {
            // Criar nova conta de staff
            const hashedPassword = await bcrypt.hash(data.passwordField, 10);
            user = await prisma.utilizador.create({
                data: {
                    nome: data.nome,
                    email: data.email,
                    passwordHash: hashedPassword,
                    role: 'STAFF'
                }
            });
        }

        // Verificar se já está associado a este evento
        const existeAssociacao = await prisma.eventoStaff.findUnique({
            where: {
                eventoId_staffId: {
                    eventoId: data.eventoId,
                    staffId: user.id
                }
            }
        });

        if (existeAssociacao) {
            return { success: false, message: 'Este staff já está associado a este evento.' };
        }

        // Criar associação
        await prisma.eventoStaff.create({
            data: {
                eventoId: data.eventoId,
                staffId: user.id
            }
        });

        return { success: true, message: 'Staff criado e associado ao evento com sucesso!' };
    } catch (error: any) {
        console.error('Erro ao criar staff:', error);
        return { success: false, message: error.message || 'Erro interno ao criar staff.' };
    }
}

export async function getStaffEquipa() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, staffList: [] };
        }

        // Procurar todos os staffs vinculados aos eventos deste organizador
        const staffEquipa = await prisma.eventoStaff.findMany({
            where: {
                evento: {
                    organizadorId: session.userId
                }
            },
            include: {
                staff: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                evento: {
                    select: {
                        id: true,
                        titulo: true
                    }
                }
            },
            orderBy: {
                evento: {
                    titulo: 'asc'
                }
            }
        });

        const staffList = staffEquipa.map(es => ({
            id: es.staff.id,
            nome: es.staff.nome,
            email: es.staff.email,
            eventoId: es.evento.id,
            eventoTitulo: es.evento.titulo,
            eventoStaffId: es.id
        }));

        return { success: true, staffList };
    } catch (error: any) {
        console.error('Erro ao listar staff:', error);
        return { success: false, staffList: [] };
    }
}

export async function removerStaff(staffId: number, eventoId: number) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ORGANIZADOR') {
            return { success: false, message: 'Não autorizado.' };
        }

        // Verificar se o organizador é dono do evento
        const evento = await prisma.evento.findFirst({
            where: { id: eventoId, organizadorId: session.userId }
        });
        if (!evento) {
            return { success: false, message: 'Não autorizado a remover staff deste evento.' };
        }

        // Remover associação
        await prisma.eventoStaff.delete({
            where: {
                eventoId_staffId: {
                    eventoId,
                    staffId
                }
            }
        });

        return { success: true, message: 'Staff removido do evento com sucesso!' };
    } catch (error: any) {
        console.error('Erro ao remover staff:', error);
        return { success: false, message: error.message || 'Erro interno.' };
    }
}
