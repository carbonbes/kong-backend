import { Module } from '@nestjs/common'
import { SignedJwtsService } from './signed-jwts.service'
import { RedisModule } from '@/redis/redis.module'
import { signedJwtSchema } from '@/signed-jwts/signed-jwts.schema'

@Module({
  imports: [RedisModule.forFeature([signedJwtSchema])],
  providers: [SignedJwtsService],
  exports: [SignedJwtsService],
})
export class SignedJwtsModule {}
