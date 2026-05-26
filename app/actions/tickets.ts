"use server";

import prisma from "../../lib/prisma";
import { z } from "zod";
import { gerarQRCodeBase64 } from "../../lib/qrcode";
import { getSession } from "../../lib/session";

export async function getTicketsData(userId: number) {
    try {
        const bilhetes = await prisma.bilhete.findMany({
            where: {
                pedido: {
                    utilizadorId: userId,
                }
            },
            include: {
                lote: {
                    include: {
                        evento: true
                    }
                },
                pedido: {
                    include: {
                        utilizador: true
                    }
                },
                registosAcesso: true,
            },
            orderBy: {
                pedido: {
                    dataPedido: 'desc'
                }
            }
        });

        const tickets = await Promise.all(bilhetes.map(async b => {
            const ev = b.lote.evento as any;
            const dateObj = new Date(ev.dataInicio);
            const qrCodeBase64 = await gerarQRCodeBase64(b.qrCodeToken);
            return {
                id: b.id,
                qrCodeToken: b.qrCodeToken,
                qrCodeBase64,
                estado: b.estado,
                loteNome: b.lote.nome,
                preco: b.lote.preco,
                eventoId: ev.id,
                eventoTitulo: ev.titulo,
                eventoLocal: ev.localizacao,
                eventoData: dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                eventoDay: dateObj.toLocaleDateString('pt-PT', { day: '2-digit' }),
                eventoMonth: dateObj.toLocaleDateString('pt-PT', { month: 'short' }),
                eventoHora: dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                pedidoEstado: b.pedido.estado,
                dataCompra: b.pedido.dataPedido.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                usado: b.registosAcesso.length > 0,
                ticketCorFundo: ev.ticketCorFundo || "#ffffff",
                ticketCorTexto: ev.ticketCorTexto || "#000000",
                ticketMensagem: ev.ticketMensagem || "Apresente este bilhete impresso ou no telemóvel na entrada do recinto.",
                ticketBackgroundUrl: ev.ticketBackgroundUrl || null,
                ticketTemplate: ev.ticketTemplate || "classic",
                ticketLogoUrl: ev.ticketLogoUrl || null,
                ticketGlow: ev.ticketGlow ?? false,
                participanteNome: (b.pedido as any).utilizador?.nome || "Participante",
            };
        }));

        return { success: true, tickets };
    } catch (error: any) {
        return { success: false, message: error.message, tickets: [] };
    }
}

export async function getBillingData(userId: number) {
    try {
        const pedidos = await prisma.pedido.findMany({
            where: { utilizadorId: userId },
            include: {
                bilhetes: {
                    include: {
                        lote: {
                            include: {
                                evento: true
                            }
                        }
                    }
                },
                pagamento: true,
            },
            orderBy: {
                dataPedido: 'desc'
            }
        });

        const orders = pedidos.map(p => {
            // Get unique event names in this order
            const eventNames = [...new Set(p.bilhetes.map(b => b.lote.evento.titulo))];

            return {
                id: p.id,
                dataPedido: p.dataPedido.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
                valorTotal: p.valorTotal,
                estado: p.estado,
                numBilhetes: p.bilhetes.length,
                eventNames,
                metodoPagamento: p.pagamento?.metodo || null,
                transacaoId: p.pagamento?.transacaoId || null,
                dataPagamento: p.pagamento?.dataPagamento
                    ? p.pagamento.dataPagamento.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
                    : null,
            };
        });

        // Calculate summary stats
        const totalGasto = pedidos
            .filter(p => p.estado === 'PAGO')
            .reduce((sum, p) => sum + p.valorTotal, 0);
        const totalPedidos = pedidos.length;
        const totalBilhetes = pedidos.reduce((sum, p) => sum + p.bilhetes.length, 0);

        return {
            success: true,
            orders,
            summary: {
                totalGasto,
                totalPedidos,
                totalBilhetes,
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message, orders: [], summary: { totalGasto: 0, totalPedidos: 0, totalBilhetes: 0 } };
    }
}

// ==========================================
// Schemas de Validação (Zod)
// ==========================================

const emitirBilheteSchema = z.object({
    eventoId: z.number().int().positive('O ID do evento é obrigatório.'),
    loteId: z.number().int().positive('O ID do lote é obrigatório.'),
    quantidade: z.number().int().min(1, 'A quantidade mínima é 1.').max(10, 'A quantidade máxima por compra é 10.'),
});

const validarBilheteSchema = z.object({
    qrCodeToken: z.string().min(1, 'O token do QR Code é obrigatório.'),
    dispositivoId: z.string().min(1, 'O ID do dispositivo é obrigatório.'),
});

// ==========================================
// Emitir Bilhete(s) com QR Code
// Adaptado do bilheteController.ts do Rafa
// ==========================================

/**
 * Emite bilhetes para um lote de um evento.
 * Cria um Pedido, gera os Bilhetes com QR Codes e decrementa o stock.
 */
export async function emitirBilhete(data: {
    eventoId: number;
    loteId: number;
    quantidade: number;
}) {
    try {
        // 1. Verificar autenticação
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Não autenticado. Faça login primeiro.' };
        }

        if (session.role === 'ORGANIZADOR' || session.role === 'STAFF' || session.role === 'ADMIN') {
            return { success: false, message: 'Contas de organizador, staff ou administradores não podem realizar compras de bilhetes.' };
        }

        // 2. Validar dados com Zod
        const parseResult = emitirBilheteSchema.safeParse(data);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const { loteId, quantidade } = parseResult.data;

        // 3. Verificar se o lote existe e tem stock disponível
        const lote = await prisma.loteBilhete.findUnique({
            where: { id: loteId },
            include: { evento: true },
        });

        if (!lote) {
            return { success: false, message: 'Lote de bilhetes não encontrado.' };
        }

        if (lote.quantidadeDisponivel < quantidade) {
            return {
                success: false,
                message: `Stock insuficiente. Apenas ${lote.quantidadeDisponivel} bilhetes disponíveis.`,
            };
        }

        // 4. Calcular valor total
        const valorTotal = lote.preco * quantidade;

        // 5. Criar Pedido + Bilhetes numa transação
        const resultado = await prisma.$transaction(async (tx) => {
            // 5.1 Criar o Pedido
            const pedido = await tx.pedido.create({
                data: {
                    utilizadorId: session.userId,
                    valorTotal,
                    estado: 'PENDENTE',
                },
            });

            // 5.2 Criar os Bilhetes com tokens únicos
            const bilhetesCriados = [];
            for (let i = 0; i < quantidade; i++) {
                const token = crypto.randomUUID();
                const bilhete = await tx.bilhete.create({
                    data: {
                        qrCodeToken: token,
                        loteId: lote.id,
                        pedidoId: pedido.id,
                        estado: 'PENDENTE',
                    },
                });
                bilhetesCriados.push(bilhete);
            }

            // 5.3 Decrementar stock do lote
            await tx.loteBilhete.update({
                where: { id: loteId },
                data: {
                    quantidadeDisponivel: {
                        decrement: quantidade,
                    },
                },
            });

            return { pedido, bilhetes: bilhetesCriados };
        });

        // 6. Gerar QR Codes para cada bilhete
        const bilhetesComQR = await Promise.all(
            resultado.bilhetes.map(async (b) => ({
                id: b.id,
                qrCodeToken: b.qrCodeToken,
                qrCodeBase64: await gerarQRCodeBase64(b.qrCodeToken),
            }))
        );

        return {
            success: true,
            message: `${quantidade} bilhete(s) emitido(s) com sucesso!`,
            pedidoId: resultado.pedido.id,
            bilhetes: bilhetesComQR,
            valorTotal,
        };
    } catch (error: any) {
        console.error('[Bilhetes] Erro ao emitir bilhete:', error);
        return { success: false, message: `Erro ao emitir bilhete: ${error.message}` };
    }
}

// ==========================================
// Validar Bilhete / Check-in por QR Code
// Adaptado do bilheteController.ts do Rafa
// ==========================================

/**
 * Valida um bilhete pelo token do QR Code.
 * Verifica se existe, se já foi usado, e marca como usado (check-in).
 */
export async function validarBilhete(data: {
    qrCodeToken: string;
    dispositivoId: string;
}) {
    try {
        // 1. Verificar autenticação (deve ser staff)
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Não autenticado.' };
        }

        // 2. Validar dados com Zod
        const parseResult = validarBilheteSchema.safeParse(data);
        if (!parseResult.success) {
            const errors = parseResult.error.flatten().fieldErrors;
            const firstError = Object.values(errors).flat()[0] || 'Dados inválidos.';
            return { success: false, message: firstError };
        }

        const { qrCodeToken, dispositivoId } = parseResult.data;

        // 3. Procurar o bilhete pelo token
        const bilhete = await prisma.bilhete.findUnique({
            where: { qrCodeToken },
            include: {
                lote: {
                    include: { evento: true },
                },
                pedido: true,
                registosAcesso: true,
            },
        });

        // 3.1 Bilhete inexistente
        if (!bilhete) {
            return { success: false, message: 'Bilhete não encontrado. QR Code inválido.' };
        }

        // 3.1.5 Verificar autorização (STAFF ou ORGANIZADOR)
        if (session.role === 'STAFF') {
            const isLinked = await prisma.eventoStaff.findUnique({
                where: {
                    eventoId_staffId: {
                        eventoId: bilhete.lote.eventoId,
                        staffId: session.userId
                    }
                }
            });
            if (!isLinked) {
                return { success: false, message: 'Não autorizado. Não pertence à equipa staff deste evento.' };
            }
        } else if (session.role === 'ORGANIZADOR') {
            if (bilhete.lote.evento.organizadorId !== session.userId) {
                return { success: false, message: 'Não autorizado. Este evento pertence a outro organizador.' };
            }
        } else {
            return { success: false, message: 'Não autorizado. Apenas organizadores ou staff podem validar bilhetes.' };
        }

        // 3.2 Verificar se o pedido está pago
        if (bilhete.pedido.estado !== 'PAGO') {
            return { success: false, message: 'Este bilhete ainda não foi pago.' };
        }

        // --- SUPORTE MULTI-DIA (PASSES GERAIS / BILHETES DIÁRIOS) ---

        // Obter data de hoje no fuso horário Europe/Lisbon como YYYY-MM-DD
        const formatter = new Intl.DateTimeFormat('pt-PT', {
            timeZone: 'Europe/Lisbon',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = formatter.formatToParts(new Date());
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        const todayStr = `${year}-${month}-${day}`;

        const loteDb = bilhete.lote as any;
        const diasValidosRaw = loteDb.diasValidos || "";
        const tipoLote = loteDb.tipo || "DIARIO";

        // 1. Validar se o dia de hoje está dentro dos dias permitidos
        if (diasValidosRaw.trim() !== "") {
            const diasList = diasValidosRaw.split(',').map((d: string) => d.trim());
            if (!diasList.includes(todayStr)) {
                return {
                    success: false,
                    message: `⚠️ Alerta: Este bilhete não é válido para o dia de hoje (${todayStr}).`
                };
            }
        }

        // 2. Controlar entradas com base no tipo de lote
        if (tipoLote === 'GERAL') {
            // Passe Geral: pode entrar em dias diferentes, mas apenas uma entrada por dia
            const jaEntrouHoje = bilhete.registosAcesso.some(r => {
                const partsAcc = formatter.formatToParts(r.dataHoraEntrada);
                const y = partsAcc.find(p => p.type === 'year')?.value;
                const m = partsAcc.find(p => p.type === 'month')?.value;
                const d = partsAcc.find(p => p.type === 'day')?.value;
                const dateStr = `${y}-${m}-${d}`;
                return dateStr === todayStr;
            });

            if (jaEntrouHoje) {
                const regHoje = bilhete.registosAcesso.find(r => {
                    const partsAcc = formatter.formatToParts(r.dataHoraEntrada);
                    const y = partsAcc.find(p => p.type === 'year')?.value;
                    const m = partsAcc.find(p => p.type === 'month')?.value;
                    const d = partsAcc.find(p => p.type === 'day')?.value;
                    const dateStr = `${y}-${m}-${d}`;
                    return dateStr === todayStr;
                });

                const horaStr = regHoje ? regHoje.dataHoraEntrada.toLocaleTimeString('pt-PT', {
                    timeZone: 'Europe/Lisbon',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '';

                return {
                    success: false,
                    message: `⚠️ Alerta: Este passe geral já efetuou check-in hoje às ${horaStr}!`,
                    alreadyUsed: true,
                    usedAt: regHoje?.dataHoraEntrada || null,
                };
            }
        } else {
            // Bilhete Diário: apenas uma utilização no total do evento
            if (bilhete.estado === 'USADO' || bilhete.registosAcesso.length > 0) {
                return {
                    success: false,
                    message: '⚠️ Alerta: Este bilhete já foi utilizado!',
                    alreadyUsed: true,
                    usedAt: bilhete.registosAcesso[0]?.dataHoraEntrada || null,
                };
            }
        }

        // 3. Determinar se é a última utilização possível para marcar como USADO
        const diasValidosList = diasValidosRaw.trim() !== "" ? diasValidosRaw.split(',').map((d: string) => d.trim()) : [];
        const totalRegistosFuturos = bilhete.registosAcesso.length + 1;
        const isLastCheckin = tipoLote === 'DIARIO' || totalRegistosFuturos >= diasValidosList.length;

        // 4. Executar check-in na base de dados
        await prisma.$transaction([
            prisma.bilhete.update({
                where: { id: bilhete.id },
                data: { estado: isLastCheckin ? 'USADO' : 'PAGO' },
            }),
            prisma.registoAcesso.create({
                data: {
                    bilheteId: bilhete.id,
                    staffId: session.userId,
                    dispositivoId,
                },
            }),
        ]);

        return {
            success: true,
            message: '✅ Check-in efetuado com sucesso. Pode entrar!',
            bilhete: {
                id: bilhete.id,
                evento: bilhete.lote.evento.titulo,
                lote: bilhete.lote.nome,
                participanteId: bilhete.pedido.utilizadorId,
            },
        };
    } catch (error: any) {
        console.error('[Bilhetes] Erro ao validar bilhete:', error);
        return { success: false, message: `Erro ao validar bilhete: ${error.message}` };
    }
}

// ==========================================
// Webhook: Processar Pagamento Concluído
// ==========================================

/**
 * Esta função é chamada PELO STRIPE WEBHOOK de forma insegura/direta (sem sessão).
 * Por isso, não usa `getSession()` mas sim o `userId` extraído dos metadados confiáveis do Stripe.
 */
export async function processarPagamentoWebhook(metadata: {
    userId: number;
    eventoId: number;
    loteId: number;
    quantidade: number;
    promotorId?: number;
}, paymentIntentId: string, valorTotalEur: number) {
    try {
        const { userId, loteId, quantidade, promotorId } = metadata;

        // 1. Verificar se o lote existe e tem stock disponível
        const lote = await prisma.loteBilhete.findUnique({
            where: { id: loteId },
            include: { evento: true },
        });

        if (!lote) {
            console.error(`[Webhook] Lote ${loteId} não encontrado.`);
            return { success: false, message: 'Lote de bilhetes não encontrado.' };
        }

        if (lote.quantidadeDisponivel < quantidade) {
            console.error(`[Webhook] Stock insuficiente para lote ${loteId}. Quantidade pedida: ${quantidade}, disponível: ${lote.quantidadeDisponivel}`);
            // NOTA: Em produção real, deverias fazer o refund automático no Stripe aqui
            return { success: false, message: `Stock insuficiente.` };
        }

        // 2. Criar Pedido + Bilhetes numa transação
        const resultado = await prisma.$transaction(async (tx) => {
            // 2.1 Criar o Pedido como PAGO
            const pedido = await tx.pedido.create({
                data: {
                    utilizadorId: userId,
                    valorTotal: valorTotalEur,
                    estado: 'PAGO',
                    promotorId: promotorId || null,
                },
            });

            // 2.2 Gravar o Pagamento (Ligação com a Transação do Stripe)
            await tx.pagamento.create({
                data: {
                    metodo: 'Stripe',
                    transacaoId: paymentIntentId,
                    pedidoId: pedido.id,
                }
            });

            // 2.3 Criar os Bilhetes com tokens únicos (QR Codes)
            const bilhetesCriados = [];
            for (let i = 0; i < quantidade; i++) {
                const token = crypto.randomUUID();
                const bilhete = await tx.bilhete.create({
                    data: {
                        qrCodeToken: token,
                        loteId: lote.id,
                        pedidoId: pedido.id,
                        estado: 'PAGO', // Já pago
                    },
                });
                bilhetesCriados.push(bilhete);
            }

            // 2.4 Decrementar stock do lote
            await tx.loteBilhete.update({
                where: { id: loteId },
                data: {
                    quantidadeDisponivel: {
                        decrement: quantidade,
                    },
                },
            });

            return { pedido, bilhetes: bilhetesCriados };
        });

        console.log(`[Webhook] ✅ Sucesso! Criados ${quantidade} bilhetes para utilizador ${userId}.`);
        return { success: true };
    } catch (error: any) {
        console.error('[Webhook] ❌ Erro ao processar webhook:', error);
        return { success: false, message: error.message };
    }
}

export async function getEventCheckins(eventoId: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, checkins: [] };

        const checkins = await prisma.registoAcesso.findMany({
            where: {
                bilhete: {
                    lote: {
                        eventoId
                    }
                }
            },
            include: {
                bilhete: {
                    include: {
                        lote: true,
                        pedido: {
                            include: {
                                utilizador: {
                                    select: { nome: true, email: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                dataHoraEntrada: 'desc'
            },
            take: 10
        });

        const formatted = checkins.map(c => ({
            id: c.id,
            data: c.dataHoraEntrada.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            lote: c.bilhete.lote.nome,
            token: c.bilhete.qrCodeToken,
            participante: c.bilhete.pedido.utilizador.nome
        }));

        return { success: true, checkins: formatted };
    } catch (e: any) {
        return { success: false, checkins: [] };
    }
}

export async function getSimulatedTickets(eventoId: number) {
    try {
        const session = await getSession();
        if (!session) return { success: false, tickets: [] };

        const tickets = await prisma.bilhete.findMany({
            where: {
                lote: {
                    eventoId
                }
            },
            include: {
                lote: true,
                pedido: {
                    include: {
                        utilizador: {
                            select: { nome: true }
                        }
                    }
                }
            },
            take: 8
        });

        const formatted = tickets.map(t => ({
            token: t.qrCodeToken,
            estado: t.estado,
            lote: t.lote.nome,
            participante: t.pedido.utilizador.nome
        }));

        return { success: true, tickets: formatted };
    } catch (e: any) {
        return { success: false, tickets: [] };
    }
}
