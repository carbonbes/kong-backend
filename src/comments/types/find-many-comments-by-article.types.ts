import { Comment } from '@/comments/entities'

export type FindManyCommentsByArticleOptions = {
  articleId: number
  cursor?: string
  limit?: number
  orderBy?: 'ASC' | 'DESC'
  parentCommentId?: number
  sortBy?: 'rating' | 'createdAt'
}

export type FindManyCommentsByArticleReturn = Promise<{
  items: Comment[]
  meta: {
    cursor: string | null
  }
}>
