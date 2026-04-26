import { Prisma } from '@/prisma/types'

export type FindManyWithCursorPaginationOptions<T> = Omit<
  Prisma.Args<T, 'findMany'>,
  'cursor' | 'orderBy'
> & {
  cursor?: string | null
  limit?: number
  orderBy?: ''
}

export type FindManyWithCursorPaginationReturn<T> = Promise<{
  items: T[]
  cursor: string | null
}>
