import { PrismaClient } from '@prisma/client'

import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL?.trim()

if (!connectionString) {
  throw new Error('DATABASE_URL nao esta definida. Cria/atualiza o ficheiro .env e reinicia o servidor Next.js.')
}

const adapter = new PrismaNeon({ connectionString })

const prismaClientSingleton = () => {
    return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
