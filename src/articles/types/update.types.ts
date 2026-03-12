import { Article } from './article.type'
import { ArticleUpdateArgs } from './article-update.type'

export type UpdateOptions = ArticleUpdateArgs
export type UpdateReturn = Promise<Article>
