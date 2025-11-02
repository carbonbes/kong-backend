import { Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { RedisModule } from '@/redis/redis.module'
import { otpSchema } from '@/otps/schema'
import { BcryptModule } from '@/bcrypt/bcrypt.module'
import { ConfigService } from '@nestjs/config'
import { OtpConfig } from '@/config/types'

@Module({
  imports: [
    RedisModule.forFeature([otpSchema]),
    BcryptModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<OtpConfig, true>) => ({
        saltOrRounds: configService.get('saltRounds'),
      }),
    }),
  ],

  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
