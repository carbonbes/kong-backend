import { Article } from '@/articles/entities'

export type UpdateOptions = {
  where: Pick<Article, 'id'>
  data: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>
}
export type UpdateReturn = Promise<Article>
