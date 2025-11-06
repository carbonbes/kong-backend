import { Prisma } from 'generated/prisma'
import UserCreateInput = Prisma.UserCreateInput
import UserFindUniqueArgs = Prisma.UserFindUniqueArgs
import UserUpdateArgs = Prisma.UserUpdateArgs

export { User, UserGender } from 'generated/prisma'

export type CreateOptions = UserCreateInput
export type FindOneOptions = UserFindUniqueArgs
export type UpdateOptions = UserUpdateArgs
export type IsExistOptions = UserFindUniqueArgs
export type SetActiveOptions = Pick<UserFindUniqueArgs, 'where'> & {
  value: boolean
}
