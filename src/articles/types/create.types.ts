import { Article } from './article.type'

export type CreateOptions = Pick<Article, 'author' | 'content'>
export type CreateReturn = Promise<Article>
