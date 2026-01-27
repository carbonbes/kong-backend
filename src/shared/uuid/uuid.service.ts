import { Injectable } from '@nestjs/common'
import { Uuid } from './uuid.types'

@Injectable()
export class UuidService {
  generate(): Uuid {
    return crypto.randomUUID()
  }
}
