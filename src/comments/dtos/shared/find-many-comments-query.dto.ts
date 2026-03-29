import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ORDER_BY, SORT_BY_FIELD } from '@/comments/consts'

export class FindManyCommentsQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cursor?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @IsOptional()
  @IsIn(ORDER_BY)
  orderBy?: (typeof ORDER_BY)[number]

  @IsOptional()
  @IsIn(SORT_BY_FIELD)
  sortBy?: (typeof SORT_BY_FIELD)[number]
}
