import { Prisma } from './prisma.type'

export type DeleteOptions<T> = Prisma.Args<T, 'delete'>
export type DeleteReturn<T, A> = Prisma.Result<T, A, 'delete'>
