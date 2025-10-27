import { DynamicModule, Module, Provider } from '@nestjs/common'
import { RedisService } from './redis.service'
import { Repository, Schema } from 'redis-om'
import { getRepositoryToken } from './utils'
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from '@/redis/redis.module-definition'
import { ConfigService } from '@nestjs/config'

@Module({})
export class RedisModule extends ConfigurableModuleClass {
  static forFeature(schemas: Schema[]): DynamicModule {
    const module = RedisModule

    const moduleOptionsProvider: Provider = {
      provide: MODULE_OPTIONS_TOKEN,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('REDIS_URL'),
      }),
    }

    const schemasProviders: Provider[] = schemas.map((schema) => ({
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

    const providers: Provider[] = [
      RedisService,
      moduleOptionsProvider,
      ...schemasProviders,
    ]

    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }
}
