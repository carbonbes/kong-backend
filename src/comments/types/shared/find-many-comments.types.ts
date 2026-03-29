import { Comment } from '@/comments/entities'
import { FindManyCommentsQueryDto } from '@/comments/dtos/shared'

export type FindManyCommentsOptions = FindManyCommentsQueryDto

export type FindManyCommentsReturn = Promise<{
  items: Comment[]
  meta: { cursor: string | null }
}>
