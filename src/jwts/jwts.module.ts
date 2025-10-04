import { Module } from '@nestjs/common'
import { JwtsService } from './jwts.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_STRATEGY_SECRET_KEY'),
      }),
    }),
  ],
  providers: [JwtsService],
  exports: [JwtsService],
})
export class JwtsModule {}
