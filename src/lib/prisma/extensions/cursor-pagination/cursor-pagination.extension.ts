import { Prisma } from '@/prisma/client'
import { CursorPaginateOptions, CursorPaginateReturn } from './types'
import { buildCursor, buildOrderBy, parseCursor } from './utils'

function createCursorPaginate() {
  return async function <T>(
    this: T,
    options: CursorPaginateOptions<T>,
  ): CursorPaginateReturn<T> {
    const context = Prisma.getExtensionContext(this)

    const {
      after,
      before,
      limit = 10,
      orderBy: order = 'asc',
      paginationKeys = ['id'],
      ...etc
    } = options

    const isBackward = !!before
    const encodedCursor = after || before
    const cursor = encodedCursor ? parseCursor<T>(encodedCursor) : undefined
    const orderBy = buildOrderBy<T>(paginationKeys, order)
    const skip = cursor ? 1 : undefined
    const take = isBackward ? -(limit + 1) : limit + 1

    const result = (await (context as any).findMany({
      cursor,
      orderBy,
      skip,
      take,
      ...etc,
    })) as Prisma.Payload<T>['scalars'][]

    const hasMore = result.length > limit

    const items = hasMore
      ? isBackward
        ? result.slice(1)
        : result.slice(0, -1)
      : result

    const firstItem = items[0]
    const lastItem = items[items.length - 1]

    return {
      items,
      meta: {
        after:
          isBackward || hasMore
            ? buildCursor<T>(lastItem, paginationKeys)
            : null,
        before: (!isBackward ? !!after : hasMore)
          ? null
          : buildCursor<T>(firstItem, paginationKeys),
      },
    }
  }
}

export const cursorPaginate = createCursorPaginate()

export const cursorPagination = () =>
  Prisma.defineExtension({
    name: 'cursor-pagination',
    model: {
      $allModels: {
        cursorPaginate: createCursorPaginate(),
      },
    },
  })
