import { Module } from '@nestjs/common'
import { JwtsService } from './jwts.service'
import { SignedJwtsModule } from '@/signed-jwts/signed-jwts.module'
import { RevokedJwtsModule } from '@/revoked-jwts/revoked-jwts.module'
import { AccessJwtsModule } from '@/access-jwts/access-jwts.module'
import { RefreshJwtsModule } from '@/refresh-jwts/refresh-jwts.module'

@Module({
  imports: [
    AccessJwtsModule,
    RefreshJwtsModule,
    SignedJwtsModule,
    RevokedJwtsModule,
  ],

  providers: [JwtsService],
  exports: [JwtsService],
})
export class JwtsModule {}
