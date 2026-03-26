import { Article } from '@/articles/entities'

export type DeleteArticleOptions = Pick<Article, 'id'>
export type DeleteArticleReturn = Promise<Article>
