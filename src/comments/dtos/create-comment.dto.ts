import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types'
import { CommentDto } from '@/comments/dtos/comment.dto'

export class CreateCommentDto extends IntersectionType(
  PartialType(PickType(CommentDto, ['parentCommentId'] as const)),
  PickType(CommentDto, ['content'] as const),
) {}
