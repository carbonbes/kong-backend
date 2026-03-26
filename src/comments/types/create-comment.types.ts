import { Comment } from '@/comments/entities'

export type CreateCommentOptions = Pick<
  Comment,
  'authorId' | 'articleId' | 'parentCommentId' | 'content'
>
export type CreateCommentReturn = Promise<Comment>
