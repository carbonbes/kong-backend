import { FindManyOptions as _FindManyOptions } from 'typeorm'
import { Article } from '@/articles/entities'

export type FindManyOptions = _FindManyOptions<Article>
export type FindManyReturn = Promise<Article[]>
