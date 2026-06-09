import { FindUniqueOptions, FindUniqueReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type FindUniqueCommentOptions = FindUniqueOptions<CommentDelegate>

export type FindUniqueCommentReturn<T extends FindUniqueCommentOptions> =
  FindUniqueReturn<CommentDelegate, T>
