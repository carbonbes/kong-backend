import { Comment } from '@/comments/entities'

export type DeleteCommentOptions = Pick<Comment, 'id'>
export type DeleteCommentReturn = Promise<Comment>
