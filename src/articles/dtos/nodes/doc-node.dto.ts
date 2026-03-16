import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator'
import {
  BlockquoteNodeDto,
  BulletListNodeDto,
  HeadingNodeDto,
  HorizontalRuleNodeDto,
  OrderedListNodeDto,
  ParagraphNodeDto,
} from './'
import { DOC_NODE_CHILD_NODES } from '@/articles/consts'

type DocChildNodes =
  | ParagraphNodeDto
  | HeadingNodeDto
  | BulletListNodeDto
  | OrderedListNodeDto
  | BlockquoteNodeDto
  | HorizontalRuleNodeDto

class DocChildNodesDto {
  @IsIn(DOC_NODE_CHILD_NODES)
  type: (typeof DOC_NODE_CHILD_NODES)[number]
}

export class DocNodeDto {
  @Equals('doc')
  type: 'doc'

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DocChildNodesDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'paragraph', value: ParagraphNodeDto },
        { name: 'heading', value: HeadingNodeDto },
        { name: 'bulletList', value: BulletListNodeDto },
        { name: 'orderedList', value: OrderedListNodeDto },
        { name: 'blockquote', value: BlockquoteNodeDto },
        { name: 'horizontalRule', value: HorizontalRuleNodeDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  content: DocChildNodes[]
}
