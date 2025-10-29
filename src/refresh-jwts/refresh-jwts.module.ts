import { Module } from '@nestjs/common'
import { RefreshJwtsService } from './refresh-jwts.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SIGN_OPTIONS_REFRESH_TOKEN_SECRET_KEY',
        ),
      }),
    }),
  ],

  providers: [RefreshJwtsService],
  exports: [RefreshJwtsService],
})
export class RefreshJwtsModule {}
