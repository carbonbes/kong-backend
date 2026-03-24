import { Article } from '@/articles/entities'
import { Comment } from '@/comments/entities'

export type FindCommentsOptions = Pick<Article, 'id'>
export type FindCommentsReturn = Promise<Comment[]>
