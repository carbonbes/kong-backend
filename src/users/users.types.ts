import { Prisma, User } from '@/prisma/prisma.types'

type UserFindUniqueArgs = Prisma.UserFindUniqueArgs

export { User, UserGender } from '@/prisma/prisma.types'

export type CreateOptions = Omit<
  Prisma.UserCreateInput,
  'isActive' | 'createdAt'
>
export type CreateReturn = Promise<User>
export type FindOneOptions = UserFindUniqueArgs
export type FindOneReturn = Promise<User | null>
export type UpdateOptions = Prisma.UserUpdateArgs
export type UpdateReturn = Promise<User>
export type IsExistOptions = UserFindUniqueArgs
export type IsExistReturn = Promise<boolean>
export type SetActiveOptions = Pick<UserFindUniqueArgs, 'where'> & {
  value: boolean
}
export type SetActiveReturn = Promise<User>
