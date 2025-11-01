import { Module } from '@nestjs/common'
import { RefreshJwtService } from './refresh-jwt.service'
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
        signOptions: {
          expiresIn: Number(
            configService.get('JWT_SIGN_OPTIONS_REFRESH_TOKEN_EXPIRES_IN'),
          ),
        },
      }),
    }),
  ],

  providers: [RefreshJwtService],
  exports: [RefreshJwtService],
})
export class RefreshJwtModule {}
