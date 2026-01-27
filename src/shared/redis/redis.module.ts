import { DynamicModule, Module, Provider } from '@nestjs/common'
import { Repository, Schema } from 'redis-om'
import { getRepositoryToken } from './redis.utils'
import { RedisCoreModule } from '@/shared/redis/redis-core.module'
import { RedisClient, RedisModuleOptions } from '@/shared/redis/redis.types'
import { REDIS_CLIENT } from '@/shared/redis/redis.consts'

@Module({})
export class RedisModule {
  static forRootAsync(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(options)],
    }
  }

  static forFeature(schemas: Schema[]): DynamicModule {
    const module = RedisModule

    const repositoryProviders: Provider[] = schemas.map((schema) => ({
      provide: getRepositoryToken(schema),
      inject: [REDIS_CLIENT],
      useFactory: async (redis: RedisClient) => {
        // @ts-ignore
        const repository = new Repository(schema, redis)
        await repository.createIndex()

        return repository
      },
    }))

    const providers = repositoryProviders
    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }
}
