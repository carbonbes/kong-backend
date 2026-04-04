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
import type { User } from '@/users/types'
import type { JSONContent } from '@tiptap/core'
import { UserDto } from '@/users/dtos'
import type { Subsite } from '@/subsites/types'
import { SubsiteDto } from '@/subsites/dtos'

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

  @IsOptional()
  @IsInt()
  @Min(1)
  subsiteId: number | null

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SubsiteDto)
  subsite: Subsite | null

  @IsInt()
  rating: number

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleContentDto)
  content: JSONContent

  @IsEnum(ArticleStatus)
  status: ArticleStatus

  @IsInt()
  createdAt: Date

  @IsInt()
  updatedAt: Date
}
