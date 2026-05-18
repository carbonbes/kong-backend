import { Prisma } from './prisma.type'

export type CreateOptions<T> = Prisma.Args<T, 'create'>
export type CreateReturn<T, A> = Prisma.Result<T, A, 'findMany'>
