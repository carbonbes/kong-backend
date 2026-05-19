import { Prisma } from '@/prisma/client'
import { CursorPaginateOptions, CursorPaginateReturn } from './types'
import { parseCursor } from '@/lib/prisma/extensions/cursor-pagination/utils'

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

    console.log(options)

    const encodedCursor = after || before
    const cursor = encodedCursor
      ? parseCursor<Prisma.Args<T, 'findMany'>['cursor']>(encodedCursor)
      : undefined

    const orderBy = paginationKeys.reduce(
      (acc, field) => {
        acc.push({ [field]: order })

        return acc
      },
      [] as Prisma.Args<T, 'findMany'>['orderBy'],
    )

    const result = await (context as any).findMany({
      cursor,
      orderBy,
      skip: cursor ? 1 : undefined,
      take: cursor ? limit + 1 : limit,
      ...etc,
    })

    const hasMore = result.length > limit
    const items = result.slice(0, -1)

    return { items, meta: { after: null, before: null } }
  }
}

export const cursorPaginate = createCursorPaginate()

export const cursorPagination = () => {
  const cursorPaginate = createCursorPaginate()

  return Prisma.defineExtension({
    name: 'cursor-pagination',
    model: {
      $allModels: {
        cursorPaginate,
      },
    },
  })
}
