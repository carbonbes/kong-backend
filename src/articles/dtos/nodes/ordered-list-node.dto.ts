import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsInt,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator'
import { ListItemNodeDto } from '@/articles/dtos/nodes/lists/list-item-node.dto'

class OrderedListNodeAttrsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  start?: number
}

export class OrderedListNodeDto {
  @Equals('orderedList')
  type: 'orderedList'

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject({ nullable: false })
  @ValidateNested()
  @Type(() => OrderedListNodeAttrsDto)
  attrs?: OrderedListNodeAttrsDto

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ListItemNodeDto)
  content: ListItemNodeDto[]
}
