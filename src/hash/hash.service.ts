import { Injectable } from '@nestjs/common'
import { createHmac } from 'node:crypto'
import { InjectHashModuleOptions } from '@/hash/decorators'
import type {
  GenerateOptions,
  GenerateReturn,
  HashModuleOptions,
} from '@/hash/types'

@Injectable()
export class HashService {
  constructor(
    @InjectHashModuleOptions() private readonly options: HashModuleOptions,
  ) {}

  generate({ value }: GenerateOptions): GenerateReturn {
    const algorithm = this.options.algorithm || 'sha256'
    const secret = this.options.secret

    return createHmac(algorithm, secret).update(value).digest('hex')
  }
}
