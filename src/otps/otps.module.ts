import { Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import { otpSchema } from '@/otps/schemas'
import { BcryptModule } from '@/shared/bcrypt/bcrypt.module'
import { ConfigService } from '@nestjs/config'
import { NanoidModule } from '@/shared/nanoid/nanoid.module'
import { UuidModule } from '@/shared/uuid/uuid.module'

@Module({
  imports: [
    RedisOmModule.forFeature([otpSchema]),
    UuidModule,
    NanoidModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        customAlphabet: {
          alphabet: configService.get('otp.alphabet')!,
          defaultSize: Number(configService.get('otp.defaultSize')),
        },
      }),
      inject: [ConfigService],
    }),
    BcryptModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        saltOrRounds: Number(configService.get('otp.rounds')),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
