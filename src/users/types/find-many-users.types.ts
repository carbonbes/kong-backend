import { FindManyOptions, FindManyReturn } from '@/prisma/types'
import { UserDelegate } from './user-delegate.type'

export type FindManyUsersOptions = FindManyOptions<UserDelegate>
export type FindManyUsersReturn = FindManyReturn<UserDelegate>
