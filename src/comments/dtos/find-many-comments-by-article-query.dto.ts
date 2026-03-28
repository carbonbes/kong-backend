import { FindManyCommentsQueryDto } from '@/comments/dtos/find-many-comments-query.dto'
import { IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class FindManyCommentsByArticleQueryDto extends FindManyCommentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentCommentId?: number
}
