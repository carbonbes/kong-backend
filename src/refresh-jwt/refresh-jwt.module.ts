import { Module } from '@nestjs/common'
import { RefreshJwtService } from './refresh-jwt.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JwtSignOptionsConfig } from '@/config/types'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<JwtSignOptionsConfig, true>,
      ) => ({
        secret: configService.get('refreshJwtSecret'),
        signOptions: {
          expiresIn: configService.get('refreshJwtExpiresIn'),
        },
      }),
    }),
  ],

  providers: [RefreshJwtService],
  exports: [RefreshJwtService],
})
export class RefreshJwtModule {}
