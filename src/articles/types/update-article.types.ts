import { Prisma } from '@/prisma/types'
import { Article } from './article.type'

export type UpdateArticleOptions = Prisma.ArticleUpdateArgs
export type UpdateArticleReturn = Promise<Article>
