import { Type } from 'class-transformer'
import { Equals, IsArray, ValidateNested } from 'class-validator'
import { TextNodeDto } from '@/articles/dtos'

export class ParagraphNodeDto {
  @Equals('paragraph')
  type: 'paragraph'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TextNodeDto)
  content: TextNodeDto[]
}
