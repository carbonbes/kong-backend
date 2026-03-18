import { Article } from './article.type'

export type FindOneOptions = Partial<Article>
export type FindOneReturn = Promise<Article | null>
