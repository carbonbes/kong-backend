import { Comment } from '@/comments/entities'
import {
  FindManyCommentsByEntityOptions,
  FindManyCommentsByEntityReturn,
} from '@/comments/types/find-many-comments-by-entity.types'

export type FindManyCommentsByArticleOptions = FindManyCommentsByEntityOptions &
  Pick<Comment, 'articleId' | 'parentCommentId'>

export type FindManyCommentsByArticleReturn = FindManyCommentsByEntityReturn
