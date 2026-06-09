import { IsIn, IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ORDER_BY, SORT_BY_FIELD } from '../consts'
import { FindManyQueryDto } from '@/prisma/dtos'
import { IntersectionType } from '@nestjs/mapped-types'

class FindManyArticlesQueryAdditionalDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number

  @IsOptional()
  @IsIn(ORDER_BY)
  orderBy?: (typeof ORDER_BY)[number]

  @IsOptional()
  @IsIn(SORT_BY_FIELD)
  sortBy?: (typeof SORT_BY_FIELD)[number]

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subsiteId?: number
}

export class FindManyArticlesQueryDto extends IntersectionType(
  FindManyQueryDto,
  FindManyArticlesQueryAdditionalDto,
) {}
