import { Comment } from '@/comments/entities'

export type DeleteOptions = Pick<Comment, 'id'>
export type DeleteReturn = Promise<Comment>
