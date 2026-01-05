import { Prisma } from '@/prisma/prisma.types'

type UserFindUniqueArgs = Prisma.UserFindUniqueArgs

export { User, UserGender } from '@/prisma/prisma.types'

export type CreateOptions = Omit<
  Prisma.UserCreateInput,
  'isActive' | 'createdAt'
>
export type FindOneOptions = UserFindUniqueArgs
export type UpdateOptions = Prisma.UserUpdateArgs
export type IsExistOptions = UserFindUniqueArgs
export type SetActiveOptions = Pick<UserFindUniqueArgs, 'where'> & {
  value: boolean
}
