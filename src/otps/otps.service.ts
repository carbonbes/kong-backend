import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Otp } from './entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  CreateOtpInput,
  CreateSignInOtpInput,
  CreateSignUpOtpInput,
  VerifyOtpInput,
} from './interface'
import { OtpType } from './enum'
import getCode from '../shared/utils/getCode'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(Otp) private readonly otpsRepository: Repository<Otp>,
  ) {}

  private async create(data: CreateOtpInput) {
    const otp = getCode()
    const expiresAt = new Date(Date.now() + 300 * 1000)

    return this.otpsRepository.save({ ...data, otp, expiresAt })
  }

  async createSignUpOtp(data: CreateSignUpOtpInput) {
    return this.create({ type: OtpType.SIGN_UP, ...data })
  }

  async createSignInOtp(data: CreateSignInOtpInput) {
    return this.create({ type: OtpType.SIGN_IN, ...data })
  }

  async verify(data: VerifyOtpInput) {
    const otp = await this.otpsRepository.findOneBy({
      otp: data.otp,
      type: data.type,
      user: { email: data.email },
    })

    if (!otp || new Date().getTime() > otp.expiresAt.getTime()) {
      return false
    }

    await this.otpsRepository.delete(otp.id)

    return true
  }
}
