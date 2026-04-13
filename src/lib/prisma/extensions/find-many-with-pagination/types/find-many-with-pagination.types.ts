import { Prisma } from '@/prisma/types'

export type FindManyWithPaginationOptions<T> = {
  cursor?: string | null
  limit?: number
  orderBy?: Prisma.SortOrder
  sortBy?: (keyof Prisma.Payload<T>['scalars'])[]
}

export type FindManyWithPaginationReturn<T> = Promise<{
  items: Prisma.Payload<T>['objects'][]
  cursor: string | null
}>
