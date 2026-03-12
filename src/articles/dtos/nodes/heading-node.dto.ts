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
import { InlineNodeDto, TextNodeDto } from '@/articles/dtos'

class HeadingNodeAttrs {
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
  @Type(() => HeadingNodeAttrs)
  attrs: HeadingNodeAttrs

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InlineNodeDto, {
    discriminator: {
      property: 'type',
      subTypes: [{ name: 'text', value: TextNodeDto }],
    },
    keepDiscriminatorProperty: true,
  })
  content: InlineNodeDto[]
}
