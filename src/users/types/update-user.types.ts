import { UpdateOptions, UpdateReturn } from '@/prisma/types'
import { UserDelegate } from './user-delegate.type'

export type UpdateUserOptions = UpdateOptions<UserDelegate>

export type UpdateUserReturn = Promise<
  UpdateReturn<UserDelegate, UpdateUserOptions>
>
