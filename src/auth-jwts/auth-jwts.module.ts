import { Module } from '@nestjs/common'
import { AuthJwtsService } from './auth-jwts.service'
import { AccessJwtModule } from '@/access-jwt/access-jwt.module'
import { RefreshJwtModule } from '@/refresh-jwt/refresh-jwt.module'

@Module({
  imports: [AccessJwtModule, RefreshJwtModule],
  providers: [AuthJwtsService],
  exports: [AuthJwtsService],
})
export class AuthJwtsModule {}
