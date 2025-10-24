import { Inject, Injectable } from '@nestjs/common'
import { AddOptions, GetOptions, HasOptions } from './revoked-jwts.types'
import { REDIS_CLIENT } from '@/redis/redis.consts'
import { RedisClient } from '@/redis/redis.types'

@Injectable()
export class RevokedJwtsService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  add({ jti, exp }: AddOptions) {
    return this.redis.set(jti, ' ', {
      expiration: { type: 'EXAT', value: exp },
    })
  }

  get(jti: GetOptions) {
    return this.redis.get(jti)
  }

  async has(jti: HasOptions) {
    return !!(await this.get(jti))
  }
}
