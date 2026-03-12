import { Equals, IsArray } from 'class-validator'

export class DocNodeDto {
  @Equals('doc')
  type: 'doc'

  @IsArray({ each: true })
  content: []
}
