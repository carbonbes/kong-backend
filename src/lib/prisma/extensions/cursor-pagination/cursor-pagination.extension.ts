import { Prisma } from '@/prisma/client'
import { CursorPaginateOptions, CursorPaginateReturn } from './types'
import { buildCursor, buildOrderBy, parseCursor } from './utils'

export async function cursorPaginate<T>(
  this: T,
  options: CursorPaginateOptions<T>,
): CursorPaginateReturn<T> {
  const context = Prisma.getExtensionContext(this) as any
  const {
    after,
    before,
    limit = 10,
    orderBy: order = 'asc',
    paginationKeys = ['id'],
    ...etc
  } = options

  const isBefore = Boolean(before && !after)
  const encodedCursor = after || before

  const cursor = encodedCursor ? parseCursor<T>(encodedCursor) : undefined
  const skip = cursor ? 1 : undefined
  const take = isBefore ? -(limit + 1) : limit + 1
  const orderBy = buildOrderBy<T>(paginationKeys, order)

  const result = (await context.findMany({
    cursor,
    orderBy,
    skip,
    take,
    ...etc,
  })) as Prisma.Payload<T>['scalars'][]

  const hasMore = result.length > limit

  const items = hasMore
    ? isBefore
      ? result.slice(1)
      : result.slice(0, -1)
    : result

  if (isBefore) items.reverse()

  const firstItem = items[0]
  const lastItem = items[items.length - 1]

  if (items.length === 0) {
    return { items, meta: { after: null, before: null } }
  }

  return {
    items,
    meta: {
      after:
        isBefore || hasMore ? buildCursor<T>(lastItem, paginationKeys) : null,
      before:
        (!isBefore && after) || (isBefore && hasMore)
          ? buildCursor<T>(firstItem, paginationKeys)
          : null,
    },
  }
}

export const cursorPagination = () =>
  Prisma.defineExtension({
    name: 'cursor-pagination',
    model: {
      $allModels: {
        cursorPaginate,
      },
    },
  })
