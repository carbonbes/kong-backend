import { Prisma } from 'generated/prisma'
import UserCreateInput = Prisma.UserCreateInput
import UserFindUniqueArgs = Prisma.UserFindUniqueArgs
import UserUpdateArgs = Prisma.UserUpdateArgs
import UserCountArgs = Prisma.UserCountArgs

export { User } from 'generated/prisma'

export type CreateOptions = UserCreateInput
export type FindOneOptions = UserFindUniqueArgs
export type UpdateOptions = UserUpdateArgs
export type IsExistOptions = UserCountArgs
