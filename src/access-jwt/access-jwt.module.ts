import { Module } from '@nestjs/common'
import { AccessJwtService } from './access-jwt.service'
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
        signOptions: {
          expiresIn: Number(
            configService.get('JWT_SIGN_OPTIONS_ACCESS_TOKEN_EXPIRES_IN'),
          ),
        },
      }),
    }),
  ],

  providers: [AccessJwtService],
  exports: [AccessJwtService],
})
export class AccessJwtModule {}
