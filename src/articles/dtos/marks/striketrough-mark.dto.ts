import { Equals } from 'class-validator'

export class StriketroughMarkDto {
  @Equals('strike')
  type: string
}
