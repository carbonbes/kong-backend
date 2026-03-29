import { Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, ValidateNested } from 'class-validator'
import { TextNodeDto } from './text-node.dto'

export class ParagraphNodeDto {
  @Equals('paragraph')
  type: 'paragraph'

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TextNodeDto)
  content: TextNodeDto[]
}
