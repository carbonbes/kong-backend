import { FindManyCommentsQueryDto } from '@/comments/dtos/shared'
import { IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class FindManyCommentsByArticleQueryDto extends FindManyCommentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentCommentId?: number
}
