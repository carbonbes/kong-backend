import { Prisma } from '@/prisma/types'
import { Comment } from './comment.type'

export type DeleteCommentOptions = Prisma.CommentDeleteArgs
export type DeleteCommentReturn = Promise<Comment>
