export type EventStatus = 'RASCUNHO' | 'CANCELADO' | 'TERMINADO' | 'A_DECORRER' | 'ESGOTADO' | 'PRE_VENDA' | 'VENDA' | 'SEM_VENDAS';

export function getEventStatus(evento: {
  estado: string;
  dataInicio: Date | string;
  dataFim?: Date | string | null;
  lotes?: Array<{ 
    nome: string; 
    quantidadeDisponivel: number; 
    lotacaoTotal: number;
    vendaInicio?: Date | string | null;
    vendaFim?: Date | string | null;
  }>;
}): EventStatus {
  if (evento.estado === 'CANCELADO') return 'CANCELADO';
  if (evento.estado === 'RASCUNHO') return 'RASCUNHO';

  const now = new Date();
  const start = new Date(evento.dataInicio);
  // Se não houver data de fim especificada, assume-se por defeito que o evento dura 4 horas
  const end = evento.dataFim ? new Date(evento.dataFim) : new Date(start.getTime() + 4 * 60 * 60 * 1000);

  if (now > end) {
    return 'TERMINADO';
  }

  if (now >= start && now <= end) {
    return 'A_DECORRER';
  }

  // Event has not started yet
  if (evento.lotes && evento.lotes.length > 0) {
    const totalDisponivel = evento.lotes.reduce((sum, l) => sum + l.quantidadeDisponivel, 0);
    if (totalDisponivel === 0) {
      return 'ESGOTADO';
    }

    // Filtrar lotes cujas vendas estão ativas neste momento
    const lotesAtivos = evento.lotes.filter(l => {
      if (l.quantidadeDisponivel === 0) return false;
      const vStart = l.vendaInicio ? new Date(l.vendaInicio) : null;
      const vEnd = l.vendaFim ? new Date(l.vendaFim) : null;
      if (vStart && now < vStart) return false;
      if (vEnd && now > vEnd) return false;
      return true;
    });

    if (lotesAtivos.length === 0) {
      return 'SEM_VENDAS';
    }

    const hasPreSale = lotesAtivos.some(
      l => l.nome.toLowerCase().includes('pré') || 
      l.nome.toLowerCase().includes('pre') || 
      l.nome.toLowerCase().includes('early') || 
      l.nome.toLowerCase().includes('antecipado')
    );

    if (hasPreSale) {
      return 'PRE_VENDA';
    }

    return 'VENDA';
  }

  return 'SEM_VENDAS';
}

export function getEventStatusLabel(status: EventStatus): string {
  switch (status) {
    case 'RASCUNHO':
      return 'Rascunho';
    case 'CANCELADO':
      return 'Cancelado';
    case 'TERMINADO':
      return 'Terminado';
    case 'A_DECORRER':
      return 'A Decorrer';
    case 'ESGOTADO':
      return 'Esgotado';
    case 'PRE_VENDA':
      return 'Em Pré-venda';
    case 'VENDA':
      return 'Vendas Abertas';
    case 'SEM_VENDAS':
    default:
      return 'Brevemente';
  }
}

export function getEventStatusColor(status: EventStatus): string {
  switch (status) {
    case 'RASCUNHO':
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    case 'CANCELADO':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'TERMINADO':
      return 'bg-slate-100 text-slate-400 border border-slate-200';
    case 'A_DECORRER':
      return 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse';
    case 'ESGOTADO':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'PRE_VENDA':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'VENDA':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'SEM_VENDAS':
    default:
      return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
  }
}
