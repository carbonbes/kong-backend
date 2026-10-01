import { Type } from 'class-transformer'
import {
  Equals,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { TextNodeDto } from './text-node.dto'

class HeadingNodeAttrsDto {
  @IsInt()
  @Min(1)
  @Max(6)
  level: 1 | 2 | 3 | 4 | 5 | 6
}

export class HeadingNodeDto {
  @Equals('heading')
  type: 'heading'

  @IsObject()
  @ValidateNested()
  @Type(() => HeadingNodeAttrsDto)
  attrs: HeadingNodeAttrsDto

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextNodeDto)
  content: TextNodeDto[]
}
