import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator'
import { Article } from '@/articles/entities'
import { ArticleStatus } from '@/articles/enums'
import { ArticleContentDto } from '@/articles/dtos/article-content.dto'
import { User } from '@/users/entities'
import type { JSONContent } from '@tiptap/core'
import { UserDto } from '@/users/dtos'
import { Subsite } from '@/subsites/entities'
import { SubsiteDto } from '@/subsites/dtos'

export class ArticleDto implements Omit<Article, 'beforeUpdateHandle'> {
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

  @IsOptional()
  @IsInt()
  @Min(1)
  subsiteId?: number | null

  @IsObject()
  @ValidateNested()
  @Type(() => SubsiteDto)
  subsite: Subsite

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleContentDto)
  content: JSONContent

  @IsInt()
  rating: number

  @IsEnum(ArticleStatus)
  status: ArticleStatus

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
