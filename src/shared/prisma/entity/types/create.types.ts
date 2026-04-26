import { Prisma } from '@/prisma/types'

export type CreateOptions<T> = Prisma.Args<T, 'create'>
export type CreateReturn<T> = Prisma.Result<T, CreateOptions<T>, 'create'>
