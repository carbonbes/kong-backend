import { Prisma } from '@/prisma/types'

export type ExistsCommentOptions = Pick<Prisma.CommentFindUniqueArgs, 'where'>
export type ExistsCommentReturn = Promise<boolean>
