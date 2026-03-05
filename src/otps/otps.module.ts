import { Global, Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import { otpSchema } from '@/otps/schemas'
import { ConfigService } from '@nestjs/config'
import { NanoidModule } from '@/shared/nanoid/nanoid.module'
import { AesModule } from '@/aes/aes.module'

@Global()
@Module({
  imports: [
    RedisOmModule.forFeature([otpSchema]),
    NanoidModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        customAlphabet: {
          alphabet: configService.get('otp.alphabet')!,
          defaultSize: Number(configService.get('otp.defaultSize')),
        },
      }),
      inject: [ConfigService],
    }),
    AesModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        key: configService.get('aes.key')!,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
