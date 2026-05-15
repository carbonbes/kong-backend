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
          options?: PaginateWithCursorOptions<T>,
        ): PaginateWithCursorReturn<T> {
          const context = Prisma.getExtensionContext(this)

          const result = (context as any).findMany(options)

          return { items: [], nextCursor: null, previousCursor: null }
        },
      },
    },
  })
