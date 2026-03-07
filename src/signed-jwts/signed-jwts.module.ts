import { Global, Module } from '@nestjs/common'
import { SignedJwtsService } from './signed-jwts.service'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import { signedJwtSchema } from '@/signed-jwts/schemas'

@Global()
@Module({
  imports: [RedisOmModule.forFeature([signedJwtSchema])],
  providers: [SignedJwtsService],
  exports: [SignedJwtsService],
})
export class SignedJwtsModule {}
