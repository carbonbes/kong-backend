import { DynamicModule, Module, Provider } from '@nestjs/common'
import { RedisService } from './redis.service'
import { Repository, Schema } from 'redis-om'
import getRepositoryToken from '@/shared/utils/getRepositoryToken'
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from '@/redis/redis.module-definition'

@Module({
  providers: [
    RedisService,
    {
      provide: MODULE_OPTIONS_TOKEN,
      useValue: { url: 'redis://localhost:6379/0' },
    },
  ],
})
export class RedisModule extends ConfigurableModuleClass {
  static forFeature(schemas: Schema[]): DynamicModule {
    const module = RedisModule

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

    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }
}
