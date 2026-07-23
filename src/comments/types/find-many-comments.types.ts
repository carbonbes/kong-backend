import {
  CursorPaginateOptions,
  CursorPaginateReturn,
} from '@/lib/prisma/extensions/cursor-pagination/types'
import { CommentDelegate } from './comment-delegate.type'

export type FindManyCommentsOptions = CursorPaginateOptions<CommentDelegate>
export type FindManyCommentsReturn = CursorPaginateReturn<CommentDelegate>
