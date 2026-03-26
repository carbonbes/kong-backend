import { Comment } from '@/comments/entities'

export type FindManyCommentsByArticleOptions = Pick<Comment, 'articleId'> & {
  limit: number
  sortBy?: keyof Pick<Comment, 'rate' | 'createdAt'>
  cursor?: string
}
export type FindManyCommentsByArticleReturn = Promise<{
  data: Comment[]
  cursor: string | null
}>
