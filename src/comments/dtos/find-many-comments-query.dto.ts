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
  @IsIn(['ASC', 'DESC'])
  orderBy?: 'ASC' | 'DESC'

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentCommentId?: number

  @IsOptional()
  @IsIn(['rating', 'createdAt'])
  sortBy?: 'rating' | 'createdAt'
}
