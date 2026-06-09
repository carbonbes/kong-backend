import { UpdateOptions, UpdateReturn } from '@/prisma/types'
import { ArticleDelegate } from './article-delegate.type'

export type UpdateArticleOptions = UpdateOptions<ArticleDelegate>

export type UpdateArticleReturn<T extends UpdateArticleOptions> = UpdateReturn<
  ArticleDelegate,
  T
>
