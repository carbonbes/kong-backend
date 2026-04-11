import { Prisma } from '@/prisma/types'
import { User } from './user.type'

export type UpdateUserOptions = Prisma.UserUpdateArgs
export type UpdateUserReturn = Promise<User>
