import { Prisma } from '@/prisma/types'
import { User } from './user.type'

export type FindManyUsersOptions = Prisma.UserFindManyArgs
export type FindManyUsersReturn = Promise<User[]>
