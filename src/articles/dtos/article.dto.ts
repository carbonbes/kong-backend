import { Article, ArticleStatus } from '@/articles/types'
import { IsDate, IsEnum, IsInt, IsObject } from 'class-validator'
import type { JsonValue } from '@/prisma/types'

export class ArticleDto implements Article {
  @IsInt()
  id: number

  @IsInt()
  authorId: number

  @IsObject()
  content: JsonValue

  @IsEnum(ArticleStatus)
  status: ArticleStatus

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
