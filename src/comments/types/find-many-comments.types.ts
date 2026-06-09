import { FindManyOptions, FindManyReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type FindManyCommentsOptions = FindManyOptions<CommentDelegate>
export type FindManyCommentsReturn = FindManyReturn<CommentDelegate>
