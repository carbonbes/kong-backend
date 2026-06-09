import { UpdateOptions, UpdateReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type UpdateCommentOptions = UpdateOptions<CommentDelegate>

export type UpdateCommentReturn<T extends UpdateCommentOptions> = UpdateReturn<
  CommentDelegate,
  T
>
