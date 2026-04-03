import { Article } from '@/articles/entities'

export type FindOneArticleOptions = Pick<Article, 'id'>
export type FindOneArticleReturn = Promise<Article | null>
