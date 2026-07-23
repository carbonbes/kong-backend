import { Prisma } from './prisma.type'

export type CreateOptions<T> = Prisma.Args<T, 'create'>
export type CreateReturn<T, A> = Promise<Prisma.Result<T, A, 'create'>>
