import { Prisma } from '@/prisma/types'

export type FindManyWithCursorPaginationOptions<T> = Omit<
  Prisma.Args<T, 'findMany'>,
  'orderBy' | 'take'
> & {
  limit?: number
  nextCursor?: string
  orderBy?: Prisma.SortOrder
  previousCursor?: string
  sortBy?: keyof Prisma.Payload<T>['scalars']
}

export type FindManyWithCursorPaginationMeta = {
  previousCursor: string | null
  nextCursor: string | null
}

export type FindManyWithCursorPaginationReturn<T> = Promise<{
  items: T[]
  meta: FindManyWithCursorPaginationMeta
}>
