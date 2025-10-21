import { Module } from '@nestjs/common'
import { ConfigurableModuleClass } from './redis.module-definition'
import { REDIS_CLIENT } from './redis.consts'
import { RedisService } from './redis.service'

@Module({
  providers: [
    RedisService,
    {
      inject: [RedisService],
      provide: REDIS_CLIENT,

      useFactory: async (redisService: RedisService) => {
        return redisService.getClient()
      },
    },
  ],

  exports: [REDIS_CLIENT],
})
export class RedisModule extends ConfigurableModuleClass {}
