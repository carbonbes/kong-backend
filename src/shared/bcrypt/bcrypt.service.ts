import { Inject, Injectable } from '@nestjs/common'
import {
  BcryptModuleOptions,
  CompareOptions,
  HashOptions,
} from './bcrypt.types'
import * as bcrypt from 'bcrypt'
import { BCRYPT_MODULE_OPTIONS } from '@/shared/bcrypt/bcrypt.consts'

@Injectable()
export class BcryptService {
  constructor(
    @Inject(BCRYPT_MODULE_OPTIONS)
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
