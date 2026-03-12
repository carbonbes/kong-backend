import { Type } from 'class-transformer'
import { Equals, IsArray, ValidateNested } from 'class-validator'
import { ListItemNodeDto } from './shared'

export class BulletListNodeDto {
  @Equals('bulletList')
  type: 'bulletList'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListItemNodeDto)
  content: ListItemNodeDto[]
}
