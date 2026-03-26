import { PickType } from '@nestjs/mapped-types'
import { CommentDto } from '@/comments/dtos/comment.dto'

export class UpdateCommentDto extends PickType(CommentDto, [
  'content',
] as const) {}
