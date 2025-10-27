import { Prisma } from 'generated/prisma'
import UserCreateInput = Prisma.UserCreateInput
import UserFindUniqueArgs = Prisma.UserFindUniqueArgs
import UserUpdateArgs = Prisma.UserUpdateArgs

export { User } from 'generated/prisma'

export type CreateUserOptions = UserCreateInput
export type FindOneUserOptions = UserFindUniqueArgs
export type UpdateUserOptions = UserUpdateArgs
