import { Prisma } from '@/prisma/prisma.types'
import { User } from './user.type'

export type UpdateOptions = Prisma.UserUpdateArgs
export type UpdateReturn = Promise<User>
