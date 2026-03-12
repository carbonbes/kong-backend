import { Type } from 'class-transformer'
import { Equals, IsArray, ValidateNested } from 'class-validator'
import { InlineNodeDto } from '@/articles/dtos'
import { TextNodeDto } from '../text-node.dto'

export class BlockquoteNodeDto {
  @Equals('blockquote')
  type: 'blockquote'

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
