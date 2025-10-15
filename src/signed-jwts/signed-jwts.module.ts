import { Module } from '@nestjs/common'
import { SignedJwtsService } from './signed-jwts.service'

@Module({
  providers: [SignedJwtsService],
})
export class SignedJwtsModule {}
