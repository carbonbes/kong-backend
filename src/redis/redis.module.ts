import { DynamicModule, Module, Provider } from '@nestjs/common'
import { RedisService } from './redis.service'
import { ConfigurableModuleClass } from '@/redis/redis.module-definition'
import { Repository, Schema } from 'redis-om'
import getRepositoryToken from '@/shared/utils/getRepositoryToken'

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule extends ConfigurableModuleClass {
  static forFeature(schemas: Schema[]): DynamicModule {
    const providers: Provider[] = schemas.map((schema) => ({
      provide: getRepositoryToken(schema),
      inject: [RedisService],
      useFactory: async (redisService: RedisService) => {
        const redis = redisService.getClient()

        // @ts-ignore
        const repository = new Repository(schema, redis)
        await repository.createIndex()

        return repository
      },
    }))

    return {
      module: RedisModule,
      providers,
      exports: providers,
    }
  }
}
