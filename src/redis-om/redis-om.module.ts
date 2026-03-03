import { DynamicModule, Module, Provider } from '@nestjs/common'
import { Repository, Schema } from 'redis-om'
import { RedisClient } from './types'
import { REDIS_CLIENT } from './consts'
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './redis-om.module-definition'
import { getRedisOmRepositoryToken } from './utils'
import { createClient } from 'redis'

@Module({})
export class RedisOmModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const base = super.forRoot(options)

    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async () => {
        const redis = createClient(options)
        await redis.connect()

        return redis
      },
    }

    const providers = [...(base.providers ?? []), redisClientProvider]
    const exports = [...(base.exports ?? []), redisClientProvider]

    return { ...base, providers, exports }
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const base = super.forRootAsync(options)

    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async (options: typeof OPTIONS_TYPE) => {
        const redis = createClient(options)
        await redis.connect()

        return redis
      },
      inject: [MODULE_OPTIONS_TOKEN],
    }

    const providers = [...(base.providers ?? []), redisClientProvider]
    const exports = [...(base.exports ?? []), redisClientProvider]

    return { ...base, providers, exports }
  }

  static forFeature(schemas: Schema[]): DynamicModule {
    const repositoryProviders: Provider[] = schemas.map((schema) => ({
      provide: getRedisOmRepositoryToken(schema),
      useFactory: async (redis: RedisClient) => {
        // @ts-expect-error repository redis client type
        const repository = new Repository(schema, redis)
        await repository.createIndex()

        return repository
      },
      inject: [REDIS_CLIENT],
    }))

    const module = RedisOmModule
    const providers = repositoryProviders
    const exports = providers

    return { module, providers, exports }
  }
}
