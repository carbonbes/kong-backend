import { Equals } from 'class-validator'

export class ItalicMarkDto {
  @Equals('italic')
  type: 'italic'
}
