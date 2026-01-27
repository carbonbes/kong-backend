import { Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { RedisModule } from '@/shared/redis/redis.module'
import { otpSchema } from '@/otps/otps.schema'
import { BcryptModule } from '@/shared/bcrypt/bcrypt.module'
import { ConfigService } from '@nestjs/config'
import { NanoidModule } from '@/shared/nanoid/nanoid.module'
import { UuidModule } from '@/shared/uuid/uuid.module'

@Module({
  imports: [
    RedisModule.forFeature([otpSchema]),
    UuidModule,

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
