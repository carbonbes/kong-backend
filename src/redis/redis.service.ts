import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { createClient } from 'redis'
import {
  ConfigModuleOptions,
  GetOptions,
  HGetOptions,
  HSetOptions,
  RedisClient,
  SetOptions,
} from './redis.types'
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: RedisClient

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: ConfigModuleOptions,
  ) {
    this.redis = createClient(this.options)
  }

  async onModuleInit() {
    await this.redis.connect()
  }

  onModuleDestroy() {
    this.redis.destroy()
  }

  set(...opts: SetOptions) {
    return this.redis.set(...opts)
  }

  get(...opts: GetOptions) {
    return this.redis.get(...opts)
  }

  hSet(...opts: HSetOptions) {
    return this.redis.hSet(...opts)
  }

  hGet(...opts: HGetOptions) {
    return this.redis.hGet(...opts)
  }
}
