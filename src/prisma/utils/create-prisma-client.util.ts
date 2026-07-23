import { OPTIONS_TYPE } from '@/prisma/prisma.module-definition'
import { PrismaClient } from '@/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { cursorPagination, existsExtension } from '@/lib/prisma/extensions'

export const createPrismaClient = (options: typeof OPTIONS_TYPE) => {
  const { isGlobal, ...prismaPgOptions } = options

  return new PrismaClient({ adapter: new PrismaPg(prismaPgOptions) })
    .$extends(existsExtension())
    .$extends(cursorPagination())
}
