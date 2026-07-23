import { createPrismaClient } from '@/prisma/utils'

export type PrismaClient = ReturnType<typeof createPrismaClient>
