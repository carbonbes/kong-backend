import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/auth/auth.module'
import { RedisModule } from '@/redis/redis.module'
import { PrismaModule } from '@/prisma/prisma.module'
import database from '@/shared/config/database'
import jwtSignOptions from '@/shared/config/jwt-sign-options'
import mailer from '@/shared/config/mailer'
import otp from '@/shared/config/otp'
import redis from '@/shared/config/redis'
import { validate } from '@/shared/config/validate'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, jwtSignOptions, mailer, otp, redis],
      validate,
    }),

    PrismaModule.forRootAsync(),

    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('redis.url')!,
      }),
    }),

    AuthModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
