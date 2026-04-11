import { Prisma } from '@/prisma/types'
import { Article } from './article.type'

export type DeleteArticleOptions = Prisma.ArticleDeleteArgs
export type DeleteArticleReturn = Promise<Article>
