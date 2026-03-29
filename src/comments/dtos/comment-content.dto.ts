import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator'
import { BlockquoteNodeDto, ParagraphNodeDto } from '@/shared/tiptap/dtos'
import { COMMENT_CONTENT_CHILD_NODES } from '@/comments/consts'
import { Type } from 'class-transformer'

type CommentContentChildNodes = ParagraphNodeDto | BlockquoteNodeDto

class CommentContentChildNodesDto {
  @IsIn(COMMENT_CONTENT_CHILD_NODES)
  type: (typeof COMMENT_CONTENT_CHILD_NODES)[number]
}

export class CommentContentDto {
  @Equals('doc')
  type: 'doc'

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CommentContentChildNodesDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'paragraph', value: ParagraphNodeDto },
        { name: 'blockquote', value: BlockquoteNodeDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  content: CommentContentChildNodes[]
}
