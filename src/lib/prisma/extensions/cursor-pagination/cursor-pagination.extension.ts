import { Prisma } from '@/prisma/client'
import {
  PaginateWithCursorOptions,
  PaginateWithCursorReturn,
} from '@/lib/prisma/extensions/cursor-pagination/types'

export const cursorPagination = () =>
  Prisma.defineExtension({
    name: 'cursor-pagination',
    model: {
      $allModels: {
        async paginateWithCursor<T>(
          this: T,
          options: PaginateWithCursorOptions<T>,
        ): PaginateWithCursorReturn<T> {
          const context = Prisma.getExtensionContext(this)
          const {
            limit: take = 10,
            nextCursor,
            orderBy: order = 'asc',
            paginationKeys = ['id'],
            previousCursor,
            ...etc
          } = options

          const cursor = {}

          const orderBy = paginationKeys.reduce(
            (acc, field) => {
              acc[field] = order

              return acc
            },
            {} as Prisma.Args<T, 'findMany'>['orderBy'],
          )

          const result = (context as any).findMany({
            ...etc,
            cursor,
            orderBy,
            take,
          })

          return { items: result, nextCursor: null, previousCursor: null }
        },
      },
    },
  })
