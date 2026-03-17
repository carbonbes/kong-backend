import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/auth/auth.module'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import database from '@/config/database'
import jwt from '@/config/jwt'
import mail from '@/config/mail'
import otp from '@/config/otp'
import redis from '@/config/redis'
import { validate } from '@/config/validate'
import { APP_GUARD } from '@nestjs/core'
import { AccessJwtAuthGuard } from '@/shared/guards/access-jwt.guard'
import { MailModule } from '@/mail/mail.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { OtpsModule } from '@/otps/otps.module'
import { SignedJwtsModule } from '@/signed-jwts/signed-jwts.module'
import { RevokedJwtsModule } from '@/revoked-jwts/revoked-jwts.module'
import { JwtCreatedListener } from '@/shared/auth-jwt/listeners'
import { ArticlesModule } from '@/articles/articles.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [database, jwt, mail, otp, redis],
      validate,
    }),
    EventEmitterModule.forRoot({
      delimiter: '_',
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        driver: PostgreSqlDriver,
        clientUrl: configService.get('database.url')!,
      }),
      inject: [ConfigService],
    }),
    RedisOmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        url: configService.get('redis.url'),
      }),
      inject: [ConfigService],
    }),
    MailModule,
    SignedJwtsModule,
    RevokedJwtsModule,
    OtpsModule,
    AuthModule,
    ArticlesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessJwtAuthGuard },
    JwtCreatedListener,
  ],
})
export class AppModule {}
