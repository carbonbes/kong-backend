import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator'
import { Article } from '@/articles/types'
import { ArticleStatus } from '@/articles/enums'
import { ArticleContentDto } from '@/articles/dtos/article-content.dto'
import type { JSONContent } from '@tiptap/core'

export class ArticleDto implements Article {
  @IsInt()
  @Min(1)
  id: number

  @IsInt()
  @Min(1)
  authorId: number

  @IsOptional()
  @IsInt()
  @Min(1)
  subsiteId: number | null

  @IsEnum(ArticleStatus)
  status: ArticleStatus

  @IsInt()
  rating: number

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleContentDto)
  content: JSONContent

  @IsInt()
  createdAt: number

  @IsInt()
  updatedAt: number
}
