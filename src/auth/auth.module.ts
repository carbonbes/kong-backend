import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '@/users/users.module'
import { OtpsModule } from '@/otps/otps.module'
import { PassportModule } from '@nestjs/passport'
import { AccessJwtStrategy } from '@/shared/strategies/passport/access-jwt.strategy'
import { JwtModule } from '@/jwt/jwt.module'
import { RefreshJwtStrategy } from '@/shared/strategies/passport/refresh-jwt.strategy'
import { MailModule } from '@/shared/mail/mail.module'

@Module({
  imports: [UsersModule, MailModule, OtpsModule, JwtModule, PassportModule],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
