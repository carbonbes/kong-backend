import { Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, ValidateNested } from 'class-validator'
import { TextNodeDto } from '@/articles/dtos'

export class ParagraphNodeDto {
  @Equals('paragraph')
  type: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TextNodeDto)
  content: TextNodeDto[]
}
