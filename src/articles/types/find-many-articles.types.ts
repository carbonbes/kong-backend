import { FindManyOptions, FindManyReturn } from '@/prisma/types'
import { ArticleDelegate } from './article-delegate.type'

export type FindManyArticlesOptions = FindManyOptions<ArticleDelegate>
export type FindManyArticlesReturn = FindManyReturn<ArticleDelegate>
