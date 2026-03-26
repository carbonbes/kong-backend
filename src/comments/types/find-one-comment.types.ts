import { Comment } from '@/comments/entities'

export type FindOneCommentOptions = Pick<Comment, 'id'>
export type FindOneCommentReturn = Promise<Comment | null>
