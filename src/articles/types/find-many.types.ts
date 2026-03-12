import { ArticleFindManyArgs } from './article-find-many.type'
import { Article } from './article.type'

export type FindManyOptions = ArticleFindManyArgs
export type FindManyReturn = Promise<Article[]>
