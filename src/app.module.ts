import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/auth/auth.module'
import { UsersModule } from '@/users/users.module'
import { OtpsModule } from '@/otps/otps.module'
import { JwtsModule } from '@/jwts/jwts.module'
import { RedisModule } from '@/redis/redis.module'
import { PrismaModule } from '@/prisma/prisma.module'
import validationSchema from '@/config/validationSchema'
import { RedisConfig } from '@/config/types'
import bcrypt from './config/bcrypt'
import database from '@/config/database'
import jwtSignOptions from '@/config/jwt-sign-options'
import mailer from './config/mailer'
import otp from '@/config/otp'
import redis from '@/config/redis'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [bcrypt, database, jwtSignOptions, mailer, otp, redis],
      skipProcessEnv: true,
      validationSchema,
    }),

    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<RedisConfig>) => ({
        url: configService.get('url'),
      }),
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    OtpsModule,
    JwtsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
