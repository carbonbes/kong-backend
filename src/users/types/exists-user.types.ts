import { Prisma } from '@/prisma/types'

export type ExistsUserOptions = Pick<Prisma.UserFindUniqueArgs, 'where'>
export type ExistsUserReturn = Promise<boolean>
