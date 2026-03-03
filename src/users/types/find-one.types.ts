import { Prisma } from '@/prisma/prisma.types'
import { User } from './user.type'

export type FindOneOptions = Prisma.UserFindUniqueArgs
export type FindOneReturn = Promise<User | null>
