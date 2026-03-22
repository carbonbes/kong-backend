import { Article } from '@/articles/entities'

export type CreateOptions = Pick<Article, 'author' | 'content'>
export type CreateReturn = Promise<Article>
