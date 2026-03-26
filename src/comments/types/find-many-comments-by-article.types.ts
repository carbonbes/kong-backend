import { Comment } from '@/comments/entities'
import { PagingResult } from 'typeorm-cursor-pagination'

export type FindManyCommentsByArticleOptions = Pick<Comment, 'articleId'> & {
  limit: number
  sortBy: keyof Pick<Comment, 'rate' | 'createdAt'>
}
export type FindManyCommentsByArticleReturn = Promise<PagingResult<Comment>>
