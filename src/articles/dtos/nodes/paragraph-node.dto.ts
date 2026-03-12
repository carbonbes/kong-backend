import { Type } from 'class-transformer'
import { Equals, IsArray, ValidateNested } from 'class-validator'
import { InlineNodeDto, TextNodeDto } from '@/articles/dtos'

export class ParagraphNodeDto {
  @Equals('paragraph')
  type: 'paragraph'

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
