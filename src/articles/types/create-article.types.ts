import { Prisma } from '@/prisma/types'
import { Article } from './article.type'

export type CreateArticleOptions = Prisma.ArticleCreateArgs
export type CreateArticleReturn = Promise<Article>
