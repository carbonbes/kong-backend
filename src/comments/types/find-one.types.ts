import { Comment } from '@/comments/entities'

export type FindOneOptions = Partial<Comment>
export type FindOneReturn = Promise<Comment | null>
