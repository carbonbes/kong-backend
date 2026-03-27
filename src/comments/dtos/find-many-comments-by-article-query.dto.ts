import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { Optional } from '@nestjs/common'
import { FindManyCommentsByArticleOptions } from '@/comments/types'

export class FindManyCommentsByArticleQueryDto {
  @Optional()
  @IsIn(['rate', 'createdAt'])
  sortBy?: FindManyCommentsByArticleOptions['sortBy']

  @Optional()
  @IsString()
  @IsNotEmpty()
  cursor?: string
}
