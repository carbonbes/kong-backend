import { Prisma } from '@/prisma/types'

export type PaginateWithCursorMeta = {
  nextCursor: string | null
  previousCursor: string | null
}

export type PaginateWithCursorOptions<T> = {
  limit?: number
  nextCursor?: string | null
  orderBy?: 'ASC' | 'DESC'
  paginationKeys?: (keyof Prisma.Payload<T, 'findMany'>['scalars'])[]
  previousCursor?: string | null
} & Omit<Prisma.Args<T, 'findMany'>, 'cursor' | 'orderBy' | 'skip' | 'take'>

export type PaginateWithCursorReturn<T> = Promise<{
  items: T[]
  meta: PaginateWithCursorMeta
}>
