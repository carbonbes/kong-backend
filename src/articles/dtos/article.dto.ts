import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  ValidateNested,
} from 'class-validator'
import { Article, ArticleStatus } from '@/articles/types'
import { DocNodeDto } from '@/articles/dtos/doc-node.dto'
import type { JsonValue } from '@/prisma/types'

export class ArticleDto implements Article {
  @IsInt()
  id: number

  @IsInt()
  authorId: number

  @IsObject()
  @ValidateNested()
  @Type(() => DocNodeDto)
  content: JsonValue

  @IsEnum(ArticleStatus)
  status: ArticleStatus

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
