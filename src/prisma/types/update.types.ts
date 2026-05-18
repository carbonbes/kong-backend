import { Prisma } from './prisma.type'

export type UpdateOptions<T> = Prisma.Args<T, 'update'>
export type UpdateReturn<T, A> = Prisma.Result<T, A, 'update'>
