import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator'
import { DOC_NODE_CHILD_NODES } from '@/articles/consts'
import { ParagraphNodeDto, BlockquoteNodeDto } from '@/shared/dtos/tiptap'
import { HeadingNodeDto } from '@/articles/dtos/nodes/heading-node.dto'
import { BulletListNodeDto } from '@/articles/dtos/nodes/bullet-list-node.dto'
import { OrderedListNodeDto } from '@/articles/dtos/nodes/ordered-list-node.dto'
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

export class ArticleContentDto {
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
