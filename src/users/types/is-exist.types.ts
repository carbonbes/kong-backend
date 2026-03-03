import { Prisma } from '@/prisma/prisma.types'

export type IsExistOptions = Prisma.UserFindUniqueArgs
export type IsExistReturn = Promise<boolean>
