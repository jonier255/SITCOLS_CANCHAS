
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env.js'

const isDev = env.NODE_ENV === 'development'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: isDev
      ? [
          { level: 'query', emit: 'event' },
          { level: 'warn', emit: 'stdout' },
          { level: 'error', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
  })
}

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (isDev) {
  globalThis.prismaGlobal = prisma

  // Log queries que tardan más de 500ms
  prisma.$on('query', (e: { duration: number; query: string }) => {
    if (e.duration > 500) {
      console.warn(`[Prisma lento] ${e.duration}ms — ${e.query}`)
    }
  })
}