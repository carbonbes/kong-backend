import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator'
import { ARTICLE_CONTENT_CHILD_NODES } from '@/articles/consts'
import {
  ParagraphNodeDto,
  HeadingNodeDto,
  BulletListNodeDto,
  OrderedListNodeDto,
  BlockquoteNodeDto,
  HorizontalRuleNodeDto,
} from '@/shared/dtos/tiptap'

type ArticleContentChildNodes =
  | ParagraphNodeDto
  | HeadingNodeDto
  | BulletListNodeDto
  | OrderedListNodeDto
  | BlockquoteNodeDto
  | HorizontalRuleNodeDto

class ArticleContentChildNodesDto {
  @IsIn(ARTICLE_CONTENT_CHILD_NODES)
  type: (typeof ARTICLE_CONTENT_CHILD_NODES)[number]
}

export class ArticleContentDto {
  @Equals('doc')
  type: 'doc'

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ArticleContentChildNodesDto, {
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
  content: ArticleContentChildNodes[]
}
