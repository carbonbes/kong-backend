import { Prisma } from '@/prisma/types'
import { CursorPaginationMeta } from 'prisma-extension-pagination'

export type FindManyWithCursorPaginationOptions<T> = Omit<
  Prisma.Args<T, 'findMany'>,
  'orderBy' | 'take'
> & {
  after?: string
  before?: string
  limit?: number
  orderBy?: Prisma.SortOrder
  sortBy?: keyof Prisma.Payload<T>['scalars']
}

export type FindManyWithCursorPaginationReturn<T> = Promise<{
  items: T[]
  meta: CursorPaginationMeta
}>
