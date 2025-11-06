import { Module } from '@nestjs/common'
import { RefreshJwtService } from './refresh-jwt.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt-sign-options.refreshJwtSecret')!,
        signOptions: {
          expiresIn: Number(
            configService.get('jwt-sign-options.refreshJwtExpiresIn'),
          ),
        },
      }),
    }),
  ],

  providers: [RefreshJwtService],
  exports: [RefreshJwtService],
})
export class RefreshJwtModule {}
