import { Prisma } from '@/prisma/types'
import { getCursor } from './getCursor.util'

export const buildCursor = <T>(
  item: Prisma.Payload<T>['scalars'],
  paginationKeys: (keyof Prisma.Payload<T, 'findMany'>['scalars'])[],
) => {
  const obj = paginationKeys.reduce(
    (acc, field) => {
      acc[field] = item[field]

      return acc
    },
    {} as Prisma.Args<T, 'findMany'>['cursor'],
  )

  return getCursor(obj)
}
