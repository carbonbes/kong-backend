import { Module } from '@nestjs/common'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { RedisModule } from '@/redis/redis.module'
import { revokedJwtSchema } from '@/revoked-jwts/revoked-jwts.schema'

@Module({
  imports: [RedisModule.forFeature([revokedJwtSchema])],
  providers: [RevokedJwtsService],
  exports: [RevokedJwtsService],
})
export class RevokedJwtsModule {}
