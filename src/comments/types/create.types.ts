import { Comment } from '@/comments/entities'

export type CreateOptions = Pick<Comment, 'authorId' | 'articleId' | 'content'>
export type CreateReturn = Promise<Comment>
