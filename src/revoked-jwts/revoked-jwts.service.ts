import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AddOptions, GetOptions, HasOptions } from './revoked-jwts.types'

@Injectable()
export class RevokedJwtsService {
  constructor(private readonly redisService: RedisService) {}

  add({ jti, exp }: AddOptions) {
    return this.redisService.set(jti, ' ', {
      expiration: { type: 'EXAT', value: exp },
    })
  }

  get(jti: GetOptions) {
    return this.redisService.get(jti)
  }

  async has(jti: HasOptions) {
    return !!(await this.get(jti))
  }
}
