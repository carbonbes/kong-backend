import { Comment } from '@/comments/entities'

export type CreateOptions = Pick<Comment, 'author' | 'article' | 'content'>
export type CreateReturn = Promise<Comment>
