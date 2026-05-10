import { PrismaClient } from '@/prisma/types'

export const truncateArticles = (prismaClient: PrismaClient) =>
  prismaClient.$queryRaw`TRUNCATE TABLE articles RESTART IDENTITY CASCADE`
