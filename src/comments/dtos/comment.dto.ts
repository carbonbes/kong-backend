import { Comment } from '@/comments/entities'
import { IsInt, IsObject, ValidateNested } from 'class-validator'
import { User } from '@/users/entities'
import { Type } from 'class-transformer'
import { UserDto } from '@/users/dtos'
import type { Article } from '@/articles/types'
import { ArticleDto } from '@/articles/dtos'
import type { JSONContent } from '@tiptap/core'

export class CommentDto implements Comment {
  @IsInt()
  id: number

  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  author: User

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleDto)
  article: Article

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleDto)
  content: JSONContent
}
