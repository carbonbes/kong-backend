import { ExistsOptions, ExistsReturn } from '@/prisma/types'
import { CommentDelegate } from './comment-delegate.type'

export type ExistsCommentOptions = ExistsOptions<CommentDelegate>
export type ExistsCommentReturn = ExistsReturn
