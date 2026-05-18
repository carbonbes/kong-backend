import { Prisma } from './prisma.type'
import { CursorPaginationMeta } from 'prisma-extension-pagination'

export type FindManyOptions<T> = {
  after?: string
  before?: string
  limit?: number
} & Prisma.Args<T, 'findMany'>

export type FindManyReturn<T> = {
  items: T[]
  meta: CursorPaginationMeta
}
