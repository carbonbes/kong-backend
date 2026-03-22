import { Article } from '@/articles/entities'

export type DeleteOptions = Pick<Article, 'id'>
export type DeleteReturn = Promise<Article>
