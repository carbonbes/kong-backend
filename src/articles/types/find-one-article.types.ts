import { Article } from '@/articles/entities'

export type FindOneArticleOptions = Partial<Article>
export type FindOneArticleReturn = Promise<Article | null>
