import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/auth/auth.module'
import { RedisOmModule } from '@/shared/redis-om/redis-om.module'
import { PrismaModule } from '@/shared/prisma/prisma.module'
import database from '@/shared/config/database'
import jwt from '@/shared/config/jwt'
import mailer from '@/shared/config/mailer'
import otp from '@/shared/config/otp'
import redis from '@/shared/config/redis'
import { validate } from '@/shared/config/validate'
import { APP_GUARD } from '@nestjs/core'
import { AccessJwtAuthGuard } from '@/shared/guards/passport/access-jwt.guard'
import { MailModule } from '@/shared/mail/mail.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, jwt, mailer, otp, redis],
      validate,
    }),
    PrismaModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get('database.url')!,
      }),
    }),
    RedisOmModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('redis.url')!,
      }),
    }),
    MailModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AccessJwtAuthGuard }],
})
export class AppModule {}
