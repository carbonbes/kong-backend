import { Prisma } from '@/prisma/client'
import {
  FindManyWithPaginationOptions,
  FindManyWithPaginationReturn,
} from './types'

export const findManyWithPagination = Prisma.defineExtension({
  model: {
    $allModels: {
      async findManyWithPagination<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'findMany'>> &
          FindManyWithPaginationOptions<T>,
      ): FindManyWithPaginationReturn<T> {
        const context = Prisma.getExtensionContext(this)
        const {
          cursor: base64Cursor,
          limit = 10,
          orderBy = 'desc',
          sortBy = ['id'],
          ...rest
        } = args

        let decodedCursor = null

        if (base64Cursor) {
          try {
            decodedCursor = JSON.parse(atob(base64Cursor))
          } catch {
            throw new Error('Invalid base64 cursor')
          }
        }

        const items = await (context as any).findMany({
          ...rest,
          cursor: decodedCursor,
          orderBy: sortBy.reduce(
            (accum, field) => (accum[field] = orderBy),
            {},
          ),
          skip: decodedCursor ? 1 : 0,
          take: limit,
        })

        let nextCursor = null

        if (items.length > 0) {
          const lastItem = items[items.length - 1]
          const cursorObj = { [sortBy]: lastItem[sortBy] }
          nextCursor = btoa(JSON.stringify(cursorObj))
        }

        return {
          items,
          cursor: nextCursor,
        }
      },
    },
  },
})
