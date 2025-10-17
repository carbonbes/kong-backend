import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AddOptions } from './signed-jwts.types'

@Injectable()
export class SignedJwtsService {
  constructor(private readonly redisService: RedisService) {}

  add({ jti, sub, exp }: AddOptions) {
    const userId = sub.toString()

    return this.redisService.hSet(userId, { jti, exp })
  }

  get() {}

  has() {}
}
