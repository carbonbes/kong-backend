import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/auth/auth.module'
import { RedisModule } from '@/shared/redis/redis.module'
import { PrismaModule } from '@/prisma/prisma.module'
import database from '@/shared/config/database'
import jwtSignOptions from '@/shared/config/jwt-sign-options'
import mailer from '@/shared/config/mailer'
import otp from '@/shared/config/otp'
import redis from '@/shared/config/redis'
import { validate } from '@/shared/config/validate'
import { APP_GUARD } from '@nestjs/core'
import { AccessJwtAuthGuard } from '@/shared/guards/passport/access-jwt.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, jwtSignOptions, mailer, otp, redis],
      validate,
    }),

    PrismaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get('database.url')!,
      }),
    }),

    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('redis.url')!,
      }),
    }),

    AuthModule,
  ],

  providers: [{ provide: APP_GUARD, useClass: AccessJwtAuthGuard }],
})
export class AppModule {}
