import { Type } from 'class-transformer'
import {
  Equals,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator'
import { ListItemNodeDto } from './shared'

class OrderedListNodeAttrsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  start?: number
}

export class OrderedListNodeDto {
  @Equals('orderedList')
  type: string

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OrderedListNodeAttrsDto)
  attrs?: OrderedListNodeAttrsDto

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListItemNodeDto)
  content: ListItemNodeDto[]
}
