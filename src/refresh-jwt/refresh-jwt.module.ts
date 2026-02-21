import { Module } from '@nestjs/common'
import { RefreshJwtService } from './refresh-jwt.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UuidModule } from '@/shared/uuid/uuid.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.refreshJwtSecret')!,
        signOptions: {
          expiresIn: Number(configService.get('jwt.refreshJwtExpiresIn')),
        },
      }),
    }),

    UuidModule,
  ],

  providers: [RefreshJwtService],
  exports: [RefreshJwtService],
})
export class RefreshJwtModule {}
