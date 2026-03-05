import { Injectable } from '@nestjs/common'
import { randomBytes, createCipheriv } from 'node:crypto'
import {
  type AesModuleOptions,
  DecryptOptions,
  DecryptReturn,
  EncryptOptions,
  EncryptReturn,
} from '@/aes/types'
import { InjectAesModuleOptions } from '@/aes/decorators'

@Injectable()
export class AesService {
  constructor(
    @InjectAesModuleOptions() private readonly options: AesModuleOptions,
  ) {}

  encrypt({ value }: EncryptOptions): EncryptReturn {
    const algorithm = 'aes-256-gcm'
    const key = randomBytes(32)
    const iv = randomBytes(16)

    const cipher = createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(value, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}:${authTag}:${encrypted}`
  }

  decrypt({ value }: DecryptOptions): DecryptReturn {
    return aes.decrypt(value, this.options.key).toString(utf8)
  }
}
