import { Module } from '@nestjs/common'
import { RevokedJwtsService } from './revoked-jwts.service'
import { RedisModule } from '../redis/redis.module'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    RedisModule.registerAsync({
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('REVOKED_JWTS_STORAGE_URL'),
      }),
    }),
  ],

  providers: [RevokedJwtsService],
  exports: [RevokedJwtsService],
})
export class RevokedJwtsModule {}
