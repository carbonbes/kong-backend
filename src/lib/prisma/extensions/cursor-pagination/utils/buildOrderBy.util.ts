import { Prisma } from '@/prisma/types'

export const buildOrderBy = <T>(
  paginationKeys: (keyof Prisma.Payload<T, 'findMany'>['scalars'])[],
  order: Prisma.SortOrder,
) =>
  paginationKeys.reduce(
    (acc, field) => {
      acc.push({ [field]: order })

      return acc
    },
    [] as Prisma.Args<T, 'findMany'>['orderBy'],
  )
