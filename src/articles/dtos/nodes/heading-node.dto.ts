import { Type } from 'class-transformer'
import {
  Equals,
  IsArray,
  IsInt,
  IsObject,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { TextNodeDto } from '@/articles/dtos'

class HeadingNodeAttrsDto {
  @IsInt()
  @Min(1)
  @Max(6)
  level: number
}

export class HeadingNodeDto {
  @Equals('heading')
  type: 'heading'

  @IsObject()
  @ValidateNested()
  @Type(() => HeadingNodeAttrsDto)
  attrs: HeadingNodeAttrsDto

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextNodeDto)
  content: TextNodeDto[]
}
