import { createPrismaClient } from '@/prisma/prisma.module'

export type { Prisma } from 'generated/prisma/client'
export type PrismaClient = ReturnType<typeof createPrismaClient>
export * from './prisma-module-options.type'
