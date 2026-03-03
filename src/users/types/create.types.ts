import { Prisma } from '@/prisma/types'
import { User } from './user.type'

export type CreateOptions = Omit<
  Prisma.UserCreateInput,
  'role' | 'isActive' | 'createdAt'
>
export type CreateReturn = Promise<User>
