import { Article } from './article.type'

export type FindManyOptions = Partial<Article>
export type FindManyReturn = Promise<Article[]>
