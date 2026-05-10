import { PrismaClient } from '@/prisma/types'

export const truncateComments = (prismaClient: PrismaClient) =>
  prismaClient.$queryRaw`TRUNCATE TABLE comments RESTART IDENTITY CASCADE`
