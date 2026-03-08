import { Global, Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { RedisOmModule } from '@/redis-om/redis-om.module'
import { otpSchema } from '@/otps/schemas'
import { ConfigService } from '@nestjs/config'
import { NanoidModule } from '@/nanoid/nanoid.module'
import { OtpCreatedListener } from '@/otps/listeners'
import { HashModule } from '@/hash/hash.module'

@Global()
@Module({
  imports: [
    RedisOmModule.forFeature([otpSchema]),
    NanoidModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        customAlphabet: {
          alphabet: configService.get('otp.alphabet')!,
          defaultSize: Number(configService.get('otp.size')),
        },
      }),
      inject: [ConfigService],
    }),
    HashModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        algorithm: 'sha512',
        secret: configService.get('otp.secret')!,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [OtpsService, OtpCreatedListener],
  exports: [OtpsService],
})
export class OtpsModule {}
