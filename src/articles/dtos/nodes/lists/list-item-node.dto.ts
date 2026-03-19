import { Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, ValidateNested } from 'class-validator'
import { ParagraphNodeDto } from '@/articles/dtos'

export class ListItemNodeDto {
  @Equals('listItem')
  type: 'listItem'

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ParagraphNodeDto)
  content: ParagraphNodeDto[]
}
