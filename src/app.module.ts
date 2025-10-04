import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { addTransactionalDataSource } from 'typeorm-transactional'
import { DataSource } from 'typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { OtpsModule } from './otps/otps.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/jwt.guard'
import { JwtsModule } from './jwts/jwts.module'
import { CacheModule } from '@nestjs/cache-manager'
import KeyvRedis from '@keyv/redis'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    CacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,

      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL')

        return {
          stores: [new KeyvRedis(redisUrl)],
        }
      },
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('TYPEORM_OPTIONS_SYNCHRONIZE'),
      }),

      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed')
        }

        return addTransactionalDataSource(new DataSource(options))
      },
    }),

    AuthModule,
    UsersModule,
    OtpsModule,
    JwtsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
