import { Article } from '@/articles/entities'

export type CreateOptions = Pick<Article, 'authorId' | 'content'>
export type CreateReturn = Promise<Article>
