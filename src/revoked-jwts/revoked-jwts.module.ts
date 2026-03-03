import { Module } from '@nestjs/common'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import { revokedJwtSchema } from '@/revoked-jwts/schemas'

@Module({
  imports: [RedisOmModule.forFeature([revokedJwtSchema])],
  providers: [RevokedJwtsService],
  exports: [RevokedJwtsService],
})
export class RevokedJwtsModule {}
