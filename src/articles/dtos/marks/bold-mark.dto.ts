import { Equals } from 'class-validator'

export class BoldMarkDto {
  @Equals('bold')
  type: 'bold'
}
