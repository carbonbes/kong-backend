import { Prisma } from '@/prisma/types'

export type ExistsArticleOptions = Pick<Prisma.ArticleFindUniqueArgs, 'where'>
export type ExistsArticleReturn = Promise<boolean>
