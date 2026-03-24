import { Comment } from '@/comments/entities'

export type CreateOptions = Pick<
  Comment,
  'authorId' | 'articleId' | 'parentCommentId' | 'content'
>
export type CreateReturn = Promise<Comment>
