import { Prisma } from './prisma.type'

export type FindUniqueOptions<T> = Prisma.Args<T, 'findUnique'>
export type FindUniqueReturn<T, A> = Promise<Prisma.Result<T, A, 'findUnique'>>
