import { Prisma } from '@/prisma/types'
import { Comment } from './comment.type'

export type FindUniqueCommentOptions = Prisma.CommentFindUniqueArgs
export type FindUniqueCommentReturn = Promise<Comment | null>
