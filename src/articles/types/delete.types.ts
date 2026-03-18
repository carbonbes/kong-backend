import { Article } from './article.type'

export type DeleteOptions = Pick<Article, 'id'>
export type DeleteReturn = Promise<Article>
