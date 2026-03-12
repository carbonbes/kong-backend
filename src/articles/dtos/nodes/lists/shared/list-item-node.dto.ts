import { Type } from 'class-transformer'
import { Equals, IsArray, IsIn, ValidateNested } from 'class-validator'
import {
  BulletListNodeDto,
  OrderedListNodeDto,
  ParagraphNodeDto,
} from '@/articles/dtos'
import { LIST_ITEM_CHILD_NODES } from '@/articles/consts'

class ListItemChildNodeDto {
  @IsIn(LIST_ITEM_CHILD_NODES)
  type: (typeof LIST_ITEM_CHILD_NODES)[number]
}

export class ListItemNodeDto {
  @Equals('listItem')
  type: 'listItem'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListItemChildNodeDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'paragraph', value: ParagraphNodeDto },
        { name: 'bulletList', value: BulletListNodeDto },
        { name: 'orderedList', value: OrderedListNodeDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  content: ListItemChildNodeDto[]
}
