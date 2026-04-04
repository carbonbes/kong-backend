import { Article } from '@/articles/entities'
import { FindManyArticlesQueryDto } from '@/articles/dtos/shared'

export type FindManyArticlesOptions = FindManyArticlesQueryDto

export type FindManyArticlesReturn = Promise<{
  items: Article[]
  meta: { cursor: string | null }
}>
