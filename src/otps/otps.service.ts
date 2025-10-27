import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/redis/utils'
import { otpSchema } from '@/otps/schema'
import { EntityId, Repository } from 'redis-om'
import { CreateOptions, Otp, VerifyOptions } from '@/otps/types'
import getCode from '@/shared/utils/getCode'
import { getHash, compare } from '@/shared/utils/useBcrypt'
import { ConfigService } from '@nestjs/config'
import getUuid from '@/shared/utils/getUuid'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(otpSchema)
    private readonly repository: Repository<Otp>,
    private readonly configService: ConfigService,
  ) {}

  async create({ type, email }: CreateOptions) {
    const id = getUuid()
    const code = getCode()
    const hash = await getHash({ value: code })
    const expiresAt = this.getExpiresAt()

    const otp = await this.repository.save({ id, code: hash, type, email })
    await this.repository.expireAt(otp[EntityId], expiresAt)

    return { id, code } as Otp
  }

  async verify({ id, code, type, email }: VerifyOptions) {
    const otp = await this.repository
      .search()
      .where('id')
      .eq(id)
      .and('type')
      .eq(type)
      .and('email')
      .eq(email)
      .returnFirst()

    if (!otp) {
      return false
    }

    const isVerify = await compare({ value: code, hash: otp.code })

    if (!isVerify) {
      return false
    }

    await this.repository.remove(otp[EntityId])

    return true
  }

  private getExpiresAt() {
    const seconds = Number(this.configService.get('OTP_EXPIRES_IN'))

    return new Date(Date.now() + seconds * 1000)
  }
}
