import { Module } from '@nestjs/common'
import { AccessJwtsService } from './access-jwts.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SIGN_OPTIONS_ACCESS_TOKEN_SECRET_KEY',
        ),
      }),
    }),
  ],

  providers: [AccessJwtsService],
  exports: [AccessJwtsService],
})
export class AccessJwtsModule {}
