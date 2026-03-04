import { Prisma } from '@/prisma/types'

export type IsExistOptions = Prisma.UserFindUniqueArgs
export type IsExistReturn = Promise<boolean>
