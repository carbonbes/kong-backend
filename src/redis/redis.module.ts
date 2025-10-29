import { DynamicModule, Module, Provider } from '@nestjs/common'
import { Repository, Schema } from 'redis-om'
import { getRepositoryToken } from './utils'
import { RedisCoreModule } from '@/redis/redis-core.module'
import { RedisClient, RedisModuleOptions } from '@/redis/types'
import { REDIS_CLIENT } from '@/redis/consts'

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

    const providers: Provider[] = schemas.map((schema) => ({
      provide: getRepositoryToken(schema),
      inject: [REDIS_CLIENT],
      useFactory: async (redis: RedisClient) => {
        // @ts-ignore
        const repository = new Repository(schema, redis)
        await repository.createIndex()

        return repository
      },
    }))

    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }
}
