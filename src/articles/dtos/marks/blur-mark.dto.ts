import { Equals } from 'class-validator'

export class BlurMarkDto {
  @Equals('blur')
  type: 'blur'
}
