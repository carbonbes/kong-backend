import { Type } from 'class-transformer'
import { Equals, IsArray, IsOptional, ValidateNested } from 'class-validator'
import { TextNodeDto } from './text-node.dto'

export class ParagraphNodeDto {
  @Equals('paragraph')
  type: 'paragraph'

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextNodeDto)
  content: TextNodeDto[]
}
