import { DeleteOptions, DeleteReturn } from '@/prisma/types'
import { UserDelegate } from './user-delegate.type'

export type DeleteUserOptions = DeleteOptions<UserDelegate>

export type DeleteUserReturn<T extends DeleteUserOptions> = DeleteReturn<
  UserDelegate,
  T
>
