import { Comment } from '@/comments/entities'
import {
  FindManyCommentsOptions,
  FindManyCommentsReturn,
} from '@/comments/types/shared'

export type FindManyCommentsByArticleOptions = FindManyCommentsOptions &
  Pick<Comment, 'articleId' | 'parentCommentId'>

export type FindManyCommentsByArticleReturn = FindManyCommentsReturn
