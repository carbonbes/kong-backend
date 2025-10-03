import { Injectable } from '@nestjs/common'
import { Otp } from './entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateOtpInput, VerifyOtpInput } from './interface'
import getCode from '../shared/utils/getCode'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(Otp) private readonly otpsRepository: Repository<Otp>,
  ) {}

  async create(data: CreateOtpInput) {
    const otp = getCode()
    const expiresAt = new Date(Date.now() + 300 * 1000)

    return this.otpsRepository.save({ ...data, otp, expiresAt })
  }

  async verify(data: VerifyOtpInput) {
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
