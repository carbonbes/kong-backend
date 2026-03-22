import { Comment } from '@/comments/entities'

export type UpdateOptions = {
  where: Pick<Comment, 'id'>
  data: Partial<Pick<Comment, 'content'>>
}
export type UpdateReturn = Promise<Comment>
