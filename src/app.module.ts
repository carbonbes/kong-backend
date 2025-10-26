import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { OtpsModule } from './otps/otps.module'
import { JwtsModule } from './jwts/jwts.module'
import {
  TransactionModule,
  txExtension,
} from '@takeny1998/nestjs-prisma-transactional'
import { PrismaService } from '@/prisma/prisma.service'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    RedisModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('REDIS_URL'),
      }),
    }),

    TransactionModule,
    AuthModule,
    UsersModule,
    OtpsModule,
    JwtsModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'PrismaService',
      useValue: new PrismaService().$extends(txExtension),
    },
  ],
  exports: ['PrismaService'],
})
export class AppModule {}
