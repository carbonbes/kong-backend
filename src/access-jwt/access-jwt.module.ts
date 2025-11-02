import { Module } from '@nestjs/common'
import { AccessJwtService } from './access-jwt.service'
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
        secret: configService.get('accessJwtSecret'),
        signOptions: {
          expiresIn: configService.get('accessJwtExpiresIn'),
        },
      }),
    }),
  ],

  providers: [AccessJwtService],
  exports: [AccessJwtService],
})
export class AccessJwtModule {}
