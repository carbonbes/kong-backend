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
import { ORDER_BY, SORT_BY_FIELD } from '../consts'

export class FindManyArticlesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subsiteId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(50)
  limit?: number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nextCursor?: string

  @IsOptional()
  @IsIn(ORDER_BY)
  orderBy?: (typeof ORDER_BY)[number]

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  previousCursor?: string

  @IsOptional()
  @IsIn(SORT_BY_FIELD)
  sortBy?: (typeof SORT_BY_FIELD)[number]
}
