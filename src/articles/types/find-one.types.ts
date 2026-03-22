import { Article } from '@/articles/entities'

export type FindOneOptions = Partial<Article>
export type FindOneReturn = Promise<Article | null>
