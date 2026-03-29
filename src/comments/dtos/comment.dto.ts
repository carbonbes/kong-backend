import { Comment } from '@/comments/entities'
import {
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator'
import { User } from '@/users/entities'
import { Type } from 'class-transformer'
import { UserDto } from '@/users/dtos'
import { Article } from '@/articles/entities'
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
  parentCommentId?: number | null

  @IsObject()
  @ValidateNested()
  @Type(() => CommentContentDto)
  content: JSONContent

  @IsInt()
  rating: number

  @IsInt()
  @Min(0)
  childrenCount: number

  @IsInt()
  @Min(0)
  createdAt: number

  @IsInt()
  @Min(0)
  updatedAt: number
}
