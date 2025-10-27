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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('REDIS_URL'),
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
