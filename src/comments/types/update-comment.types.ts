import { Prisma } from '@/prisma/types'
import { Comment } from './comment.type'

export type UpdateCommentOptions = Prisma.CommentUpdateArgs
export type UpdateCommentReturn = Promise<Comment>
