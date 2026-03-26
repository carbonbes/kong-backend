import { Order, PagingQuery } from 'typeorm-cursor-pagination'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class PagingQueryDto implements PagingQuery {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  afterCursor: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  beforeCursor: string

  @IsOptional()
  @IsInt()
  limit: number

  @IsOptional()
  @IsEnum(Order)
  order: 'ASC' | 'DESC'
}
