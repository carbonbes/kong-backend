import { Article } from '@/articles/entities'

export type CreateArticleOptions = Pick<Article, 'authorId' | 'content'>
export type CreateArticleReturn = Promise<Article>
