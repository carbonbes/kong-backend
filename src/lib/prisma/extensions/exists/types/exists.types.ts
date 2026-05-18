import { Prisma } from '@/prisma/types'

export type ExistsOptions<T> = Prisma.Args<T, 'count'>
export type ExistsReturn = Promise<boolean>
