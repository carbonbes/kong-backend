import { Comment } from '@/comments/entities'

export type FindOneOptions = Pick<Comment, 'id'>
export type FindOneReturn = Promise<Comment | null>
