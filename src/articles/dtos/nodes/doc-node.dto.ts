import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator'
import { DOC_NODE_CHILD_NODES } from '@/articles/consts'
import { ParagraphNodeDto } from '@/articles/dtos/nodes/paragraph-node.dto'
import { HeadingNodeDto } from '@/articles/dtos/nodes/heading-node.dto'
import { BulletListNodeDto } from '@/articles/dtos/nodes/bullet-list-node.dto'
import { OrderedListNodeDto } from '@/articles/dtos/nodes/ordered-list-node.dto'
import { BlockquoteNodeDto } from '@/articles/dtos/nodes/blockquote-node.dto'
import { HorizontalRuleNodeDto } from '@/articles/dtos/nodes/horizontal-rule-node.dto'

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
