import { Injectable } from '@nestjs/common'
import {
  BcryptModuleOptions,
  CompareOptions,
  HashOptions,
} from './bcrypt.types'
import * as bcrypt from 'bcrypt'
import { InjectBcryptModuleOptions } from '@/shared/bcrypt/bcrypt.utils'

@Injectable()
export class BcryptService {
  constructor(
    @InjectBcryptModuleOptions()
    private readonly options: BcryptModuleOptions,
  ) {}

  hash({ value }: HashOptions) {
    const { rounds } = this.options

    return bcrypt.hash(value, rounds)
  }

  compare({ value, encoded }: CompareOptions) {
    return bcrypt.compare(value, encoded)
  }
}
