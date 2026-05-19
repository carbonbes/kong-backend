import {
  CursorPaginateOptions,
  CursorPaginateReturn,
} from '@/lib/prisma/extensions/cursor-pagination/types'

export type FindManyOptions<T> = CursorPaginateOptions<T>
export type FindManyReturn<T> = CursorPaginateReturn<T>
