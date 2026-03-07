import { Injectable } from '@nestjs/common'
import {
  type BcryptModuleOptions,
  CompareOptions,
  CompareReturn,
  HashOptions,
  HashReturn,
} from './types'
import * as bcrypt from 'bcrypt'
import { InjectBcryptModuleOptions } from './decorators'

@Injectable()
export class BcryptService {
  constructor(
    @InjectBcryptModuleOptions()
    private readonly options: BcryptModuleOptions,
  ) {}

  hash({ value }: HashOptions): HashReturn {
    const { rounds } = this.options

    return bcrypt.hash(value, rounds)
  }

  compare({ value, hash }: CompareOptions): CompareReturn {
    return bcrypt.compare(value, hash)
  }
}
