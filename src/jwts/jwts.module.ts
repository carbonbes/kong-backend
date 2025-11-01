import { Module } from '@nestjs/common'
import { JwtsService } from './jwts.service'
import { SignedJwtsModule } from '@/signed-jwts/signed-jwts.module'
import { RevokedJwtsModule } from '@/revoked-jwts/revoked-jwts.module'
import { AccessJwtModule } from '@/access-jwt/access-jwt.module'
import { RefreshJwtModule } from '@/refresh-jwt/refresh-jwt.module'

@Module({
  imports: [
    AccessJwtModule,
    RefreshJwtModule,
    SignedJwtsModule,
    RevokedJwtsModule,
  ],

  providers: [JwtsService],
  exports: [JwtsService],
})
export class JwtsModule {}
