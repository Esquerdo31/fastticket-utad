import prisma from '../lib/prisma'

async function main() {
  console.log('Iniciando script de seeding...')

  // Limpar tabelas caso já tenham dados (opcional, mas garante idempotência)
  await prisma.loteBilhete.deleteMany({})
  await prisma.evento.deleteMany({})

  // Criar um utilizador organizador (se não existir)
  const organizador = await prisma.utilizador.upsert({
    where: { email: 'organizador@utad.pt' },
    update: {},
    create: {
      nome: 'Serviços Académicos',
      email: 'organizador@utad.pt',
      passwordHash: 'dummy-hash', // Não importa para login
      role: 'ORGANIZADOR',
    },
  })

  // Criar Evento 1
  await prisma.evento.create({
    data: {
      titulo: "Congresso Internacional de Inovação Digital",
      descricao: "Conferência de renome abordando tendências da Inovação Digital nas Universidades, com foco em tecnologias imersivas.",
      dataInicio: new Date("2024-10-15T09:00:00Z"),
      localizacao: "Aula Magna, Vila Real",
      lotacaoMaxima: 500,
      organizadorId: organizador.id,
      lotes: {
        create: [
          { nome: "Colóquio Docente", preco: 45.0, quantidadeDisponivel: 0, lotacaoTotal: 50, descricao: "Acesso à sessão fechada (ESGOTADO)" },
          { nome: "Bilhete Estudante UTAD", preco: 12.50, quantidadeDisponivel: 450, lotacaoTotal: 500, descricao: "Acesso total às palestras. Necessita Cartão Estudante." }
        ]
      }
    }
  })

  // Criar Evento 2
  await prisma.evento.create({
    data: {
      titulo: "Workshop de Inteligência Artificial Generativa",
      descricao: "Sessão intensiva focada no uso de Modelos de Linguagem para otimização de estudo e investigação.",
      dataInicio: new Date("2024-10-28T14:30:00Z"),
      localizacao: "Online (via Zoom)",
      lotacaoMaxima: 150,
      organizadorId: organizador.id,
      lotes: {
        create: [
          { nome: "Entrada Livre", preco: 0.0, quantidadeDisponivel: 15, lotacaoTotal: 150, descricao: "Registo online gratuito. Garanta já a sua vaga!" }
        ]
      }
    }
  })

  // Criar Evento 3
  await prisma.evento.create({
    data: {
      titulo: "Torneio Inter-Universitário de Atletismo",
      descricao: "Competições desportivas de primavera em formato de liga estudantil. Vem apoiar a nossa equipa de Atletismo!",
      dataInicio: new Date("2024-11-02T10:00:00Z"),
      localizacao: "Estádio da UTAD",
      lotacaoMaxima: 800,
      organizadorId: organizador.id,
      lotes: {
        create: [
          { nome: "Bancada Central", preco: 5.0, quantidadeDisponivel: 340, lotacaoTotal: 700, descricao: "Lugar não marcado nas bancadas principais do estádio." },
          { nome: "VIP Desportivo", preco: 15.0, quantidadeDisponivel: 12, lotacaoTotal: 100, descricao: "Acesso com lugar marcado e zona de catering reservada." }
        ]
      }
    }
  })

  console.log('Seeding concluído com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
