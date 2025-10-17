import { Module } from '@nestjs/common'
import { JwtsService } from './jwts.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { SignedJwtsModule } from '../signed-jwts/signed-jwts.module'
import { RevokedJwtsModule } from '../revoked-jwts/revoked-jwts.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_STRATEGY_SECRET_KEY'),
      }),
    }),

    SignedJwtsModule,
    RevokedJwtsModule,
  ],

  providers: [JwtsService],
  exports: [JwtsService],
})
export class JwtsModule {}
