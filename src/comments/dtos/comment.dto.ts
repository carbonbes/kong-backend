import { Comment } from '@/comments/types'
import {
  IsDate,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator'
import type { User } from '@/users/types'
import { Type } from 'class-transformer'
import { UserDto } from '@/users/dtos'
import type { Article } from '@/articles/types'
import { ArticleDto } from '@/articles/dtos'
import type { JSONContent } from '@tiptap/core'
import { CommentContentDto } from '@/comments/dtos/comment-content.dto'

export class CommentDto implements Comment {
  @IsInt()
  @Min(1)
  id: number

  @IsInt()
  @Min(1)
  authorId: number

  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  author: User

  @IsInt()
  @Min(1)
  articleId: number

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleDto)
  article: Article

  @IsOptional()
  @IsInt()
  @Min(1)
  parentCommentId: number | null

  @IsObject()
  @ValidateNested()
  @Type(() => CommentContentDto)
  content: JSONContent

  @IsInt()
  rating: number

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
