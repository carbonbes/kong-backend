import { Injectable } from '@nestjs/common'
import { BaseService } from '../shared/base.service'
import { Otp } from './entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { VerifyOtpInput } from './interface'

@Injectable()
export class OtpsService extends BaseService<Otp> {
  constructor(
    @InjectRepository(Otp) private readonly otpsRepository: Repository<Otp>,
  ) {
    super(otpsRepository)
  }

  async verify(data: VerifyOtpInput) {
    const otp = await this.otpsRepository.findOneBy(data)

    return !(!otp || otp.expiresAt < new Date())
  }
}
