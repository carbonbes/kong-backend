import { Injectable } from '@nestjs/common'
import { BcryptModuleOptions, CompareOptions, HashOptions } from './types'
import * as bcrypt from 'bcrypt'
import { InjectOptions } from '@/bcrypt/bcrypt.decorators'

@Injectable()
export class BcryptService {
  constructor(
    @InjectOptions()
    private readonly options: BcryptModuleOptions,
  ) {}

  hash({ value }: HashOptions) {
    const { saltOrRounds } = this.options

    console.log(this.options)

    return bcrypt.hash(value, saltOrRounds)
  }

  compare({ value, encoded }: CompareOptions) {
    return bcrypt.compare(value, encoded)
  }
}
