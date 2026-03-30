import { Comment } from '@/comments/entities'
import {
  FindManyCommentsOptions,
  FindManyCommentsReturn,
} from '@/comments/types/shared'

export type FindManyCommentsByAuthorOptions = FindManyCommentsOptions &
  Pick<Comment, 'authorId'>

export type FindManyCommentsByAuthorReturn = FindManyCommentsReturn
