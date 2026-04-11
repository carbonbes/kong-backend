import { Prisma } from '@/prisma/client'

type FindManyWithCursorPaginationReturn<T> = Promise<{
  items: T[]
  meta: { cursor: string | null }
}>

export const findManyWithCursorPagination = Prisma.defineExtension({
  model: {
    $allModels: {
      async findManyWithCursorPagination<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'findMany'>> & { cursor?: string },
      ): FindManyWithCursorPaginationReturn<T> {
        const context = Prisma.getExtensionContext(this)
        const { cursor: base64Cursor, ...rest } = args as any

        let decodedCursor = undefined

        if (base64Cursor) {
          try {
            decodedCursor = JSON.parse(
              Buffer.from(base64Cursor, 'base64').toString('utf-8'),
            )
          } catch (e) {
            throw new Error('Invalid base64 cursor')
          }
        }

        const items = await (context as any).findMany({
          ...rest,
          cursor: decodedCursor,
          skip: decodedCursor ? 1 : 0,
        })

        let nextCursor = null

        if (items.length > 0) {
          const lastItem = items[items.length - 1]
          const cursorObj = { id: lastItem.id }
          nextCursor = JSON.stringify(cursorObj)
        }

        return {
          items,
          meta: { cursor: nextCursor },
        }
      },
    },
  },
})
