import { Prisma } from '@/prisma/types'
import { User } from './user.type'

export type DeleteUserOptions = Prisma.UserDeleteArgs
export type DeleteUserReturn = Promise<User>
