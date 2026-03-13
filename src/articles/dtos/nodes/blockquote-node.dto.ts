import { Type } from 'class-transformer'
import { Equals, IsArray, ValidateNested } from 'class-validator'
import { ParagraphNodeDto } from '@/articles/dtos'

export class BlockquoteNodeDto {
  @Equals('blockquote')
  type: 'blockquote'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParagraphNodeDto)
  content: ParagraphNodeDto[]
}
