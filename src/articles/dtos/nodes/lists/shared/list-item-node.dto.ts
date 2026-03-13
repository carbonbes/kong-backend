import { Type } from 'class-transformer'
import { Equals, IsArray, ValidateNested } from 'class-validator'
import { ParagraphNodeDto } from '@/articles/dtos'

export class ListItemNodeDto {
  @Equals('listItem')
  type: 'listItem'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParagraphNodeDto)
  content: ParagraphNodeDto[]
}
