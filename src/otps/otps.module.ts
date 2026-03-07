import { Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { OtpCreatedListener } from '@/otps/listeners'
import { ConfigurableModuleClass } from '@/otps/otps.module-definition'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import { otpTimeStepSchema } from '@/otps/schemas'

@Module({
  imports: [RedisOmModule.forFeature([otpTimeStepSchema])],
  providers: [OtpsService, OtpCreatedListener],
  exports: [OtpsService],
})
export class OtpsModule extends ConfigurableModuleClass {}
