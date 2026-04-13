import { Prisma } from '@/prisma/types'

export type ExistsCommentOptions = Pick<Prisma.CommentCountArgs, 'where'>
export type ExistsCommentReturn = Promise<boolean>
