import { Injectable } from '@nestjs/common'
import { Otp } from './otps.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  CreateOtpOptions,
  CreateOtpReturn,
  VerifyOtpOptions,
  VerifyOtpReturn,
} from './otps.types'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(Otp) private readonly otpsRepository: Repository<Otp>,
  ) {}

  async create(data: CreateOtpOptions): CreateOtpReturn {
    return this.otpsRepository.save(data)
  }

  async verify(data: VerifyOtpOptions): VerifyOtpReturn {
    const otp = await this.otpsRepository.findOneBy({
      otp: data.otp,
      type: data.type,
      user: { email: data.email },
    })

    if (!otp || Date.now() > otp.expiresAt.getTime()) {
      return false
    }

    await this.otpsRepository.delete(otp.id)

    return true
  }
}
