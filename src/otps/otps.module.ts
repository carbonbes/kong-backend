import { Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Otp } from './otps.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Otp])],
  providers: [OtpsService],
  exports: [OtpsService],
})
export class OtpsModule {}
