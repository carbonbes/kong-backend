import { ArticleFindUniqueArgs } from './article-find-unique.type'
import { Article } from './article.type'

export type FindUniqueOptions = ArticleFindUniqueArgs
export type FindUniqueReturn = Promise<Article | null>
