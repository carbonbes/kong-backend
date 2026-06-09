import { IsIn, IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ORDER_BY, SORT_BY_FIELD } from '@/comments/consts'
import { FindManyQueryDto } from '@/prisma/dtos'
import { IntersectionType } from '@nestjs/mapped-types'

class FindManyCommentsQueryAdditionalDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  articleId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentCommentId?: number

  @IsOptional()
  @IsIn(ORDER_BY)
  orderBy?: (typeof ORDER_BY)[number]

  @IsOptional()
  @IsIn(SORT_BY_FIELD)
  sortBy?: (typeof SORT_BY_FIELD)[number]
}

export class FindManyCommentsQueryDto extends IntersectionType(
  FindManyQueryDto,
  FindManyCommentsQueryAdditionalDto,
) {}
