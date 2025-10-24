import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '@/users/users.module'
import { OtpsModule } from '@/otps/otps.module'
import { PassportModule } from '@nestjs/passport'
import { AccessJwtStrategy } from '@/shared/strategies/access-jwt.strategy'
import { JwtsModule } from '@/jwts/jwts.module'
import { RefreshJwtStrategy } from '@/shared/strategies/refresh-jwt.strategy'

@Module({
  imports: [UsersModule, OtpsModule, JwtsModule, PassportModule],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
