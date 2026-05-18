import { ExistsOptions, ExistsReturn } from '@/prisma/types'
import { ArticleDelegate } from './article-delegate.type'

export type ExistsArticleOptions = ExistsOptions<ArticleDelegate>
export type ExistsArticleReturn = ExistsReturn
