import { Comment } from '@/comments/entities'

type SortFields = Extract<keyof Comment, 'createdAt' | 'rating'>

export const SORT_BY_FIELD: readonly [SortFields, SortFields] = [
  'createdAt',
  'rating',
] as const
