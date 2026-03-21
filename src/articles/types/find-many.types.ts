import { FindManyOptions as _FindManyOptions } from 'typeorm'
import { Article } from './article.type'

export type FindManyOptions = _FindManyOptions<Article>
export type FindManyReturn = Promise<Article[]>
