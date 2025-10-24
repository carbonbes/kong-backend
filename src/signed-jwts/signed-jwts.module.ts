import { Module } from '@nestjs/common'
import { SignedJwtsService } from './signed-jwts.service'
import { RedisModule } from '@/redis/redis.module'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    RedisModule.registerAsync({
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('SIGNED_JWTS_REDIS_STORAGE_URL'),
      }),
    }),
  ],

  providers: [SignedJwtsService],
  exports: [SignedJwtsService],
})
export class SignedJwtsModule {}
