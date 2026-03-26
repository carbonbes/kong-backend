import { FindManyOptions } from 'typeorm'
import { Article } from '@/articles/entities'

export type FindManyArticlesOptions = FindManyOptions<Article>
export type FindManyArticlesReturn = Promise<Article[]>
