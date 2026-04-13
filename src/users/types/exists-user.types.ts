import { Prisma } from '@/prisma/types'

export type ExistsUserOptions = Pick<Prisma.UserCountArgs, 'where'>
export type ExistsUserReturn = Promise<boolean>
