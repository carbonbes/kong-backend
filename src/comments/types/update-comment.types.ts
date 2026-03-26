import { Comment } from '@/comments/entities'

export type UpdateCommentOptions = {
  where: Pick<Comment, 'id'>
  data: Pick<Comment, 'content'>
}
export type UpdateCommentReturn = Promise<Comment>
