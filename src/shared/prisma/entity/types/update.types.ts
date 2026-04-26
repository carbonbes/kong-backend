import { Prisma } from '@/prisma/types'

export type UpdateOptions<T> = Prisma.Args<T, 'update'>
export type UpdateReturn<T> = Prisma.Result<T, UpdateOptions<T>, 'update'>
