import { Type } from 'class-transformer'
import { Equals, IsArray, IsIn, ValidateNested } from 'class-validator'
import {
  BlockquoteNodeDto,
  BulletListNodeDto,
  HeadingNodeDto,
  HorizontalRuleNodeDto,
  OrderedListNodeDto,
  ParagraphNodeDto,
} from './nodes'
import { DOC_NODE_CHILD_NODES } from '@/articles/consts'

class DocChildNodesDto {
  @IsIn(DOC_NODE_CHILD_NODES)
  type: (typeof DOC_NODE_CHILD_NODES)[number]
}

export class DocNodeDto {
  @Equals('doc')
  type: 'doc'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocChildNodesDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'paragraph', value: ParagraphNodeDto },
        { name: 'heading', value: HeadingNodeDto },
        { name: 'blockquote', value: BlockquoteNodeDto },
        { name: 'bulletList', value: BulletListNodeDto },
        { name: 'orderedList', value: OrderedListNodeDto },
        { name: 'horizontalRule', value: HorizontalRuleNodeDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  content: DocChildNodesDto[]
}
