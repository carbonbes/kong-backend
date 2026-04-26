import { Prisma } from '@/prisma/types'

export type DeleteOptions<T> = Prisma.Args<T, 'delete'>
export type DeleteReturn<T> = Prisma.Result<T, DeleteOptions<T>, 'delete'>
