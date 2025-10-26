import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { createClient } from 'redis'
import { ConfigModuleOptions, RedisClient } from './types'
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: RedisClient

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: ConfigModuleOptions,
  ) {
    this.redis = createClient(this.options) as RedisClient
  }

  async onModuleInit() {
    await this.redis.connect()
  }

  onModuleDestroy() {
    this.redis.destroy()
  }

  getClient() {
    return this.redis
  }
}
