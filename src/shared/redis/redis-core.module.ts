import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { createClient } from 'redis'
import {
  RedisClient,
  RedisModuleAsyncOptions,
  RedisModuleOptions,
  RedisOptionsFactory,
} from '@/shared/redis/redis.types'
import {
  REDIS_CLIENT,
  REDIS_MODULE_ID,
  REDIS_MODULE_OPTIONS,
} from '@/shared/redis/redis.consts'
import {
  generateString,
  InjectRedisModuleOptions,
} from '@/shared/redis/redis.utils'

@Global()
@Module({})
export class RedisCoreModule implements OnApplicationShutdown {
  constructor(
    @InjectRedisModuleOptions()
    private readonly options: RedisModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: RedisModuleOptions = {}): DynamicModule {
    const redisModuleOptions = {
      provide: REDIS_MODULE_OPTIONS,
      useValue: options,
    }

    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async () => {
        const redis = createClient(options)
        await redis.connect()
        return redis
      },
    }

    const providers = [redisClientProvider, redisModuleOptions]
    const exports = [redisClientProvider]

    return {
      module: RedisCoreModule,
      providers,
      exports,
    }
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      inject: [REDIS_MODULE_OPTIONS],
      useFactory: async (redisOptions: RedisModuleOptions) => {
        const redis = createClient(redisOptions)
        await redis.connect()
        return redis
      },
    }

    const asyncProviders = this.createAsyncProviders(options)

    const providers = [
      ...asyncProviders,
      redisClientProvider,
      {
        provide: REDIS_MODULE_ID,
        useValue: generateString(),
      },
      ...(options.extraProviders || []),
    ]

    const exports = [redisClientProvider]

    return {
      module: RedisCoreModule,
      imports: options.imports,
      providers,
      exports,
    }
  }

  async onApplicationShutdown(): Promise<void> {
    const client = this.moduleRef.get<RedisClient>(REDIS_CLIENT)
    try {
      await client.quit()
    } catch {}
  }

  private static createAsyncProviders(
    options: RedisModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    const useClass = options.useClass as Type<RedisOptionsFactory>

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(
    options: RedisModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: REDIS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<RedisOptionsFactory>,
    ]

    return {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: async (optionsFactory: RedisOptionsFactory) =>
        await optionsFactory.createRedisOptions(),
      inject,
    }
  }
}
