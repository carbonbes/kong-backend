import { Prisma } from '@/prisma/types'
import { Article } from './article.type'

export type FindManyArticlesOptions = Prisma.ArticleFindManyArgs
export type FindManyArticlesReturn = Promise<Article[]>
