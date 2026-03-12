import { ArticleCreateArgs } from './article-create.type'
import { Article } from './article.type'

export type CreateOptions = ArticleCreateArgs
export type CreateReturn = Promise<Article>
