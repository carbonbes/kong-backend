import { Prisma } from '@/prisma/types'

export type FindManyOptions<T> = Prisma.Args<T, 'findMany'>
export type FindManyReturn<T> = Prisma.Result<T, FindManyOptions<T>, 'findMany'>
