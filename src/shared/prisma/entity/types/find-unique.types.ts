import { Prisma } from '@/prisma/types'

export type FindUniqueOptions<T> = Prisma.Args<T, 'findUnique'>

export type FindUniqueReturn<T> = Prisma.Result<
  T,
  FindUniqueOptions<T>,
  'findUnique'
>
