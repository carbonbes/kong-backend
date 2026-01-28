import { Module } from '@nestjs/common'
import { JwtsService } from './jwts.service'
import { JwtStorageModule } from '@/jwt-storage/jwt-storage.module'
import { JwtModule } from '@nestjs/jwt'
import { UuidModule } from '@/shared/uuid/uuid.module'

@Module({
  imports: [JwtModule, JwtStorageModule, UuidModule],
  providers: [JwtsService],
  exports: [JwtsService],
})
export class JwtsModule {}
