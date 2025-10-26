import { Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { RedisModule } from '@/redis/redis.module'
import { otpSchema } from '@/otps/schema'

@Module({
  imports: [RedisModule.forFeature([otpSchema])],
  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
