import { Prisma } from '@/prisma/types'
import { Comment } from './comment.type'

export type CreateCommentOptions = Prisma.CommentCreateArgs
export type CreateCommentReturn = Promise<Comment>
