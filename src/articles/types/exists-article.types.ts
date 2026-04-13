import { Prisma } from '@/prisma/types'

export type ExistsArticleOptions = Pick<Prisma.ArticleCountArgs, 'where'>
export type ExistsArticleReturn = Promise<boolean>
