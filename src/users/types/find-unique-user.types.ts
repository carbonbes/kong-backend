import { Prisma } from '@/prisma/types'
import { User } from './user.type'

export type FindUniqueUserOptions = Prisma.UserFindUniqueArgs
export type FindUniqueUserReturn = Promise<User | null>
