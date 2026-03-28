import { Comment } from '@/comments/entities'

export type FindManyCommentsByEntityOptions = {
  cursor?: string
  limit?: number
  orderBy?: 'ASC' | 'DESC'
  sortBy?: keyof Pick<Comment, 'createdAt' | 'rating'>
}

export type FindManyCommentsByEntityReturn = Promise<{
  items: Comment[]
  meta: { cursor: string | null }
}>
