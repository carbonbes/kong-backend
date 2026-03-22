import { Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, ValidateNested } from 'class-validator'
import { ListItemNodeDto } from './list-item-node.dto'

export class BulletListNodeDto {
  @Equals('bulletList')
  type: 'bulletList'

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ListItemNodeDto)
  content: ListItemNodeDto[]
}
