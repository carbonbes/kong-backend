import { FindUniqueOptions, FindUniqueReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type FindUniqueCommentOptions = FindUniqueOptions<CommentDelegate>

export type FindUniqueCommentReturn = Promise<
  FindUniqueReturn<CommentDelegate, FindUniqueCommentOptions>
>
