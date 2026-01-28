import { Module } from '@nestjs/common'
import { JwtStorageService } from './jwt-storage.service'
import { RedisModule } from '@/shared/redis/redis.module'
import { jwtStorageSchema } from '@/jwt-storage/jwt-storage.schema'

@Module({
  imports: [RedisModule.forFeature([jwtStorageSchema])],
  providers: [JwtStorageService],
  exports: [JwtStorageService],
})
export class JwtStorageModule {}
