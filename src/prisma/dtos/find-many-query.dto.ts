import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class FindManyQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  after?: string

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
}
