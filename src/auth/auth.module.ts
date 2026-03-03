import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '@/users/users.module'
import { OtpsModule } from '@/otps/otps.module'
import { PassportModule } from '@nestjs/passport'
import { AccessJwtStrategy } from '@/shared/strategies/access-jwt.strategy'
import { RefreshJwtStrategy } from '@/shared/strategies/refresh-jwt.strategy'
import { AccessJwtModule } from '@/access-jwt/access-jwt.module'
import { RefreshJwtModule } from '@/refresh-jwt/refresh-jwt.module'
import { SignedJwtsModule } from '@/signed-jwts/signed-jwts.module'
import { RevokedJwtsModule } from '@/revoked-jwts/revoked-jwts.module'

@Module({
  imports: [
    UsersModule,
    OtpsModule,
    AccessJwtModule,
    RefreshJwtModule,
    SignedJwtsModule,
    RevokedJwtsModule,
    PassportModule,
  ],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
