import { DeleteOptions, DeleteReturn } from '@/prisma/types'
import { ArticleDelegate } from './article-delegate.type'

export type DeleteArticleOptions = DeleteOptions<ArticleDelegate>

export type DeleteArticleReturn = DeleteReturn<
  ArticleDelegate,
  DeleteArticleOptions
>
