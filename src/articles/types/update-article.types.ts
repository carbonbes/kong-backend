import { Article } from '@/articles/entities'

export type UpdateArticleOptions = {
  where: Pick<Article, 'id'>
  data: Partial<Pick<Article, 'content' | 'status'>>
}
export type UpdateArticleReturn = Promise<Article>
