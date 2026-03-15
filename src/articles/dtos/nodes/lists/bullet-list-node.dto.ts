import { Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, ValidateNested } from 'class-validator'
import { ListItemNodeDto } from './shared'

export class BulletListNodeDto {
  @Equals('bulletList')
  type: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ListItemNodeDto)
  content: ListItemNodeDto[]
}
