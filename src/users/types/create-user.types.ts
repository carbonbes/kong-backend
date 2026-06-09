import { CreateOptions, CreateReturn } from '@/prisma/types'
import { UserDelegate } from './user-delegate.type'

export type CreateUserOptions = CreateOptions<UserDelegate>

export type CreateUserReturn<T extends CreateUserOptions> = CreateReturn<
  UserDelegate,
  T
>
