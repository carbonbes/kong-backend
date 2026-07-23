import { CreateOptions, CreateReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type CreateCommentOptions = CreateOptions<CommentDelegate>

export type CreateCommentReturn = Promise<
  CreateReturn<CommentDelegate, CreateCommentOptions>
>
