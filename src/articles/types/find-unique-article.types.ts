import { Prisma } from '@/prisma/types'
import { Article } from './article.type'

export type FindUniqueArticleOptions = Prisma.ArticleFindUniqueArgs
export type FindUniqueArticleReturn = Promise<Article | null>
