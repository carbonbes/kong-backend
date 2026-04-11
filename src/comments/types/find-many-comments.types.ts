import { Prisma } from '@/prisma/types'
import { Comment } from './comment.type'

export type FindManyCommentsOptions = Prisma.CommentFindManyArgs
export type FindManyCommentsReturn = Promise<Comment[]>
