import { Inject, Injectable } from '@nestjs/common'
import { AddOptions, GetAllOptions, GetOptions } from './signed-jwts.types'
import { REDIS_CLIENT } from '../redis/redis.consts'
import { RedisClient } from '../redis/redis.types'

@Injectable()
export class SignedJwtsService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  async add({ jti, sub, exp }: AddOptions) {
    const key = sub.toString()
    const ttl = exp.toString()

    await Promise.all([
      this.redis.hSet(key, jti, ' '),
      this.redis.sendCommand(['HEXPIREAT', key, ttl, 'FIELDS', '1', jti]),
    ])

    return true
  }

  get({ sub, field }: GetOptions) {
    const key = sub.toString()

    return this.redis.hGet(key, field)
  }

  getAll({ sub }: GetAllOptions) {
    const key = sub.toString()

    return this.redis.hGetAll(key)
  }
}
