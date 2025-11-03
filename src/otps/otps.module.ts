import { Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { RedisModule } from '@/redis/redis.module'
import { otpSchema } from '@/otps/schema'
import { BcryptModule } from '@/bcrypt/bcrypt.module'
import { ConfigService } from '@nestjs/config'
import { NanoidModule } from '@/nanoid/nanoid.module'

@Module({
  imports: [
    RedisModule.forFeature([otpSchema]),

    NanoidModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        customAlphabet: {
          alphabet: configService.get('otp.alphabet')!,
          defaultSize: Number(configService.get('otp.defaultSize')),
        },
      }),
    }),

    BcryptModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        rounds: Number(configService.get('otp.rounds')),
      }),
    }),
  ],

  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
