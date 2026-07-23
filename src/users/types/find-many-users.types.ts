import {
  CursorPaginateOptions,
  CursorPaginateReturn,
} from '@/lib/prisma/extensions/cursor-pagination/types'
import { UserDelegate } from './user-delegate.type'

export type FindManyUsersOptions = CursorPaginateOptions<UserDelegate>
export type FindManyUsersReturn = CursorPaginateReturn<UserDelegate>
