import { CreateOptions, CreateReturn } from '@/prisma/types'
import { ArticleDelegate } from './article-delegate.type'

export type CreateArticleOptions = CreateOptions<ArticleDelegate>

export type CreateArticleReturn = CreateReturn<
  ArticleDelegate,
  CreateArticleOptions
>
