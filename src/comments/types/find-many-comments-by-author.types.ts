import { Comment } from '@/comments/entities'
import { PagingResult } from 'typeorm-cursor-pagination'

export type FindManyCommentsByAuthorOptions = Pick<Comment, 'authorId'> & {
  limit: number
  sortBy: keyof Pick<Comment, 'rate' | 'createdAt'>
}

export type FindManyCommentsByAuthorReturn = Promise<PagingResult<Comment>>
