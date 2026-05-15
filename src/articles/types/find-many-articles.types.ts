import { Article } from './article.type'
import { ArticleDelegate } from './article-delegate.type'
import {
  PaginateWithCursorOptions,
  PaginateWithCursorReturn,
} from '@/lib/prisma/extensions/cursor-pagination/types'

export type FindManyArticlesOptions = PaginateWithCursorOptions<ArticleDelegate>
export type FindManyArticlesReturn = PaginateWithCursorReturn<Article>
