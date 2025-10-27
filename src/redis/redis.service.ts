import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import { createClient } from 'redis'
import { RedisModuleOptions, RedisClient } from './types'
import { MODULE_OPTIONS_TOKEN } from '@/redis/redis.module-definition'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: RedisClient

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: RedisModuleOptions,
  ) {
    this.redis = createClient(this.options) as RedisClient
    ;(async () => {
      await this.redis.connect()
    })()
  }

  onModuleDestroy() {
    this.redis.destroy()
  }

  getClient() {
    return this.redis
  }
}
