import { PrismaClient } from '@/prisma/types'

export const resetDb = async (prismaClient: PrismaClient) => {
  const tables = await prismaClient.$queryRaw`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma_migrations';
  `
}
