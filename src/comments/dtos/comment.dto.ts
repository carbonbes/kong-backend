import { Comment } from '@/comments/entities'
import {
  IsDate,
  IsInt,
  IsObject,
  IsOptional,
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
  id: number

  @IsInt()
  authorId: number

  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  author: User

  @IsInt()
  articleId: number

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleDto)
  article: Article

  @IsOptional()
  @IsInt()
  parentCommentId?: number | null

  @IsObject()
  @ValidateNested()
  @Type(() => CommentContentDto)
  content: JSONContent

  @IsInt()
  rate: number

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
