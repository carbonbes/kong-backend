import { FindUniqueOptions, FindUniqueReturn } from '@/prisma/types'
import { UserDelegate } from './user-delegate.type'

export type FindUniqueUserOptions = FindUniqueOptions<UserDelegate>

export type FindUniqueUserReturn = Promise<
  FindUniqueReturn<UserDelegate, FindUniqueUserOptions>
>
