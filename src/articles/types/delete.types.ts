import { ArticleDeleteArgs } from './article-delete.type'
import { Article } from './article.type'

export type DeleteOptions = ArticleDeleteArgs
export type DeleteReturn = Promise<Article>
