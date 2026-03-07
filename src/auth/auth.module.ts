import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '@/users/users.module'
import { PassportModule } from '@nestjs/passport'
import { AccessJwtStrategy } from '@/shared/strategies/access-jwt.strategy'
import { RefreshJwtStrategy } from '@/shared/strategies/refresh-jwt.strategy'
import { AuthJwtsModule } from '@/auth-jwts/auth-jwts.module'

@Module({
  imports: [UsersModule, AuthJwtsModule, PassportModule],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
