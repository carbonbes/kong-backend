import { Equals } from 'class-validator'

export class HorizontalRuleNodeDto {
  @Equals('horizontalRule')
  type: 'horizontalRule'
}
