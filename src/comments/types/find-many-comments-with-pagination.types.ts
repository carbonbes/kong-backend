import { Prisma } from '@/prisma/types'
import { Comment } from './comment.type'
import {
  FindManyWithPaginationOptions,
  FindManyWithPaginationReturn,
} from '@/lib/prisma/extensions/find-many-with-pagination/types'

export type FindManyCommentsWithPaginationOptions = Prisma.CommentFindManyArgs &
  FindManyWithPaginationOptions<Comment>

export type FindManyCommentsWithPaginationReturn =
  FindManyWithPaginationReturn<Comment>
