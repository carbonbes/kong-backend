import { Module } from '@nestjs/common'
import { AuthJwtsService } from './auth-jwts.service'
import { AccessJwtModule } from '@/access-jwt/access-jwt.module'
import { RefreshJwtModule } from '@/refresh-jwt/refresh-jwt.module'
import { SignedJwtsModule } from '@/signed-jwts/signed-jwts.module'
import { RevokedJwtsModule } from '@/revoked-jwts/revoked-jwts.module'

@Module({
  imports: [
    AccessJwtModule,
    RefreshJwtModule,
    SignedJwtsModule,
    RevokedJwtsModule,
  ],

  providers: [AuthJwtsService],
  exports: [AuthJwtsService],
})
export class AuthJwtsModule {}
