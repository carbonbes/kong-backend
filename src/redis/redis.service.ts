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
  SAddOptions,
  SetOptions,
  SMembersOptions,
} from './redis.types'
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: ConfigModuleOptions,
  ) {}

  private client: RedisClient

  async onModuleInit() {
    this.client = await createClient({
      url: this.options.url,
    }).connect()
  }

  onModuleDestroy() {
    this.client.destroy()
  }

  set(...opts: SetOptions) {
    return this.client.set(...opts)
  }

  get(...opts: GetOptions) {
    return this.client.get(...opts)
  }

  sAdd(...opts: SAddOptions) {
    return this.client.sAdd(...opts)
  }

  sMembers(...opts: SMembersOptions) {
    return this.client.sMembers(...opts)
  }

  hSet(...opts: HSetOptions) {
    return this.client.hSet(...opts)
  }

  hGet(...opts: HGetOptions) {
    return this.client.hGet(...opts)
  }
}
