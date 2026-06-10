import { PrismaClient } from '@/prisma/types'

export const truncateUsers = (prismaClient: PrismaClient) =>
  prismaClient.$queryRaw`TRUNCATE TABLE users RESTART IDENTITY CASCADE`
