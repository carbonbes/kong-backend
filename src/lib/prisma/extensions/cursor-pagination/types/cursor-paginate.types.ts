import { Prisma } from '@/prisma/types'

export type CursorPaginateOptions<T> = Omit<
  Prisma.Args<T, 'findMany'>,
  'cursor' | 'orderBy' | 'take'
> & {
  after?: string
  before?: string
  limit?: number
  orderBy?: Prisma.SortOrder
  paginationKeys?: (keyof Prisma.Payload<T, 'findMany'>['scalars'])[]
}

export type CursorPaginateMeta = {
  after: string | null
  before: string | null
  total: number
}

export type CursorPaginateReturn<T> = Promise<{
  items: Prisma.Payload<T, 'findMany'>['scalars'][]
  meta: CursorPaginateMeta
}>
