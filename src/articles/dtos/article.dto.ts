import { Type } from 'class-transformer'
import {
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  ValidateNested,
} from 'class-validator'
import { Article } from '@/articles/types'
import { ArticleStatus } from '@/articles/enums'
import { DocNodeDto } from '@/articles/dtos/nodes/doc-node.dto'
import { User } from '@/users/entities'
import type { JSONContent } from '@tiptap/core'
import { UserDto } from '@/users/dtos'

export class ArticleDto implements Article {
  @IsInt()
  id: number

  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  author: User

  @IsObject()
  @ValidateNested()
  @Type(() => DocNodeDto)
  content: JSONContent

  @IsEnum(ArticleStatus)
  status: ArticleStatus

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
