import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/auth/auth.module'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import { PrismaModule } from '@/prisma/prisma.module'
import database from '@/config/database'
import jwt from '@/config/jwt'
import mail from '@/config/mail'
import otp from '@/config/otp'
import redis from '@/config/redis'
import { validate } from '@/config/validate'
import { APP_GUARD } from '@nestjs/core'
import { AccessJwtAuthGuard } from '@/shared/guards/access-jwt.guard'
import { MailModule } from '@/mail/mail.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, jwt, mail, otp, redis],
      validate,
    }),
    PrismaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get('database.url'),
      }),
    }),
    RedisOmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('redis.url'),
      }),
    }),
    MailModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AccessJwtAuthGuard }],
})
export class AppModule {}
