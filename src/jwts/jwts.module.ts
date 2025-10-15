import { Module } from '@nestjs/common'
import { JwtsService } from './jwts.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RedisModule } from '../redis/redis.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_STRATEGY_SECRET_KEY'),
      }),
    }),

    RedisModule.registerAsync({
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('REDIS_URL'),
      }),
    }),
  ],

  providers: [JwtsService],
  exports: [JwtsService],
})
export class JwtsModule {}
