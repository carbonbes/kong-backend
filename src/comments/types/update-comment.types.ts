import { UpdateOptions, UpdateReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type UpdateCommentOptions = UpdateOptions<CommentDelegate>

export type UpdateCommentReturn = Promise<
  UpdateReturn<CommentDelegate, UpdateCommentOptions>
>
