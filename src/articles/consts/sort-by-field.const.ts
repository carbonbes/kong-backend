import { Article } from '@/articles/entities'

type SortFields = Extract<keyof Article, 'createdAt' | 'rating'>

export const SORT_BY_FIELD: readonly [SortFields, SortFields] = [
  'createdAt',
  'rating',
] as const
