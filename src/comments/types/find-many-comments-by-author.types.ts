import { Comment } from '@/comments/entities'
import {
  FindManyCommentsByEntityOptions,
  FindManyCommentsByEntityReturn,
} from '@/comments/types/find-many-comments-by-entity.types'

export type FindManyCommentsByAuthorOptions = FindManyCommentsByEntityOptions &
  Pick<Comment, 'authorId'>

export type FindManyCommentsByAuthorReturn = FindManyCommentsByEntityReturn
