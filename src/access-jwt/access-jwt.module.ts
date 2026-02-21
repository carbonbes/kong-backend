import { Module } from '@nestjs/common'
import { AccessJwtService } from './access-jwt.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UuidModule } from '@/shared/uuid/uuid.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.accessJwtSecret')!,
        signOptions: {
          expiresIn: Number(configService.get('jwt.accessJwtExpiresIn')),
        },
      }),
    }),

    UuidModule,
  ],

  providers: [AccessJwtService],
  exports: [AccessJwtService],
})
export class AccessJwtModule {}
