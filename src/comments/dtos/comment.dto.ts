import { Comment } from '@/comments/types'
import {
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import type { JSONContent } from '@tiptap/core'
import { CommentContentDto } from '@/comments/dtos/comment-content.dto'

export class CommentDto implements Comment {
  @IsInt()
  @Min(1)
  id: number

  @IsInt()
  @Min(1)
  authorId: number

  @IsInt()
  @Min(1)
  articleId: number

  @IsOptional()
  @IsInt()
  @Min(1)
  parentCommentId: number | null

  @IsInt()
  rating: number

  @IsObject()
  @ValidateNested()
  @Type(() => CommentContentDto)
  content: JSONContent

  @IsInt()
  @Min(0)
  createdAt: number

  @IsInt()
  @Min(0)
  updatedAt: number
}
