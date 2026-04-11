import { Prisma } from '@/prisma/types'
import { User } from './user.type'

export type CreateUserOptions = Prisma.UserCreateArgs
export type CreateUserReturn = Promise<User>
