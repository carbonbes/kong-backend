import { Injectable } from '@nestjs/common'
import { GenerateReturn } from './types'

@Injectable()
export class UuidService {
  generate(): GenerateReturn {
    return crypto.randomUUID()
  }
}
