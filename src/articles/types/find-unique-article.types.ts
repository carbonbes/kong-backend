import { FindUniqueOptions, FindUniqueReturn } from '@/prisma/types'
import { ArticleDelegate } from './article-delegate.type'

export type FindUniqueArticleOptions = FindUniqueOptions<ArticleDelegate>

export type FindUniqueArticleReturn<T extends FindUniqueArticleOptions> =
  FindUniqueReturn<ArticleDelegate, T>
