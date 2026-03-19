import { Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, ValidateNested } from 'class-validator'
import { ParagraphNodeDto } from '@/articles/dtos/nodes/paragraph-node.dto'

export class BlockquoteNodeDto {
  @Equals('blockquote')
  type: 'blockquote'

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ParagraphNodeDto)
  content: ParagraphNodeDto[]
}
