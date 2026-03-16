import { Equals } from 'class-validator'

export class StrikeMarkDto {
  @Equals('strike')
  type: 'strike'
}
