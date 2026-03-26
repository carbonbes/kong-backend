import { PickType } from '@nestjs/mapped-types'
import { CommentDto } from '@/comments/dtos/comment.dto'

export class CreateCommentDto extends PickType(CommentDto, [
  'parentCommentId',
  'content',
] as const) {}
