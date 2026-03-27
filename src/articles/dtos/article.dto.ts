import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  ValidateNested,
} from 'class-validator'
import { Article } from '@/articles/entities'
import { ArticleStatus } from '@/articles/enums'
import { ArticleContentDto } from '@/articles/dtos/article-content.dto'
import { User } from '@/users/entities'
import type { JSONContent } from '@tiptap/core'
import { UserDto } from '@/users/dtos'

export class ArticleDto implements Article {
  @IsInt()
  id: number

  @IsInt()
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

  @IsDate()
  createdAt: number

  @IsDate()
  updatedAt: number
}
