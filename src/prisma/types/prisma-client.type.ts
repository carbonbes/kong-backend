import { createPrismaClient } from '@/prisma/prisma.module'

export type PrismaClient = ReturnType<typeof createPrismaClient>
