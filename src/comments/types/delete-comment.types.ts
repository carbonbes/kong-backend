import { DeleteOptions, DeleteReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type DeleteCommentOptions = DeleteOptions<CommentDelegate>

export type DeleteCommentReturn = Promise<
  DeleteReturn<CommentDelegate, DeleteCommentOptions>
>
