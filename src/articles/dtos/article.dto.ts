import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsObject, Min, ValidateNested } from 'class-validator'
import { Article } from '@/articles/entities'
import { ArticleStatus } from '@/articles/enums'
import { ArticleContentDto } from '@/articles/dtos/article-content.dto'
import { User } from '@/users/entities'
import type { JSONContent } from '@tiptap/core'
import { UserDto } from '@/users/dtos'

export class ArticleDto implements Article {
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

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleContentDto)
  content: JSONContent

  @IsEnum(ArticleStatus)
  status: ArticleStatus

  @IsInt()
  createdAt: number

  @IsInt()
  updatedAt: number
}
