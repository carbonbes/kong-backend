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
  @IsString()
  @IsNotEmpty()
  after?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  before?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(50)
  limit?: number

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
