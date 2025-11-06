import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common'
import { RedisClient, RedisModuleOptions } from '@/redis/redis.types'
import { REDIS_CLIENT } from '@/redis/redis.consts'
import { createClient } from 'redis'
import { ModuleRef } from '@nestjs/core'

@Global()
@Module({})
export class RedisCoreModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  static forRootAsync(options: RedisModuleOptions): DynamicModule {
    const module = RedisCoreModule

    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async () => {
        const redis = createClient(options)
        await redis.connect()

        return redis
      },
    }

    const providers: Provider[] = [redisClientProvider]
    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }

  onApplicationShutdown() {
    const client = this.moduleRef.get<RedisClient>(REDIS_CLIENT)
    client.destroy()
  }
}
