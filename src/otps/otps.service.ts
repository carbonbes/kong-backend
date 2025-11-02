import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/redis/utils'
import { otpSchema } from '@/otps/schema'
import { EntityId, Repository } from 'redis-om'
import { CreateOptions, Otp, VerifyOptions } from '@/otps/types'
import getCode from '@/shared/utils/getCode'
import { ConfigService } from '@nestjs/config'
import getUuid from '@/shared/utils/getUuid'
import { OtpConfig } from '@/config/types'
import { BcryptService } from '@/bcrypt/bcrypt.service'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(otpSchema)
    private readonly repository: Repository<Otp>,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService<OtpConfig, true>,
  ) {}

  async create({ type, userId }: CreateOptions) {
    const id = getUuid()
    const code = getCode()
    const codeHash = await this.bcryptService.hash({ value: code })

    const otp = await this.repository.save({
      id,
      code: codeHash,
      type,
      userId,
    })

    const entityId = otp[EntityId]
    const expiresAt = this.getExpiresAt()
    await this.repository.expireAt(entityId, expiresAt)

    return { ...otp, code } as Otp
  }

  async verify({ id, code, type, userId }: VerifyOptions) {
    const otp = await this.repository
      .search()
      .where('id')
      .eq(id)
      .and('type')
      .eq(type)
      .and('userId')
      .eq(userId)
      .returnFirst()

    if (!otp) {
      return false
    }

    const isVerify = await this.bcryptService.compare({
      value: code,
      encoded: otp.code,
    })

    if (!isVerify) {
      return false
    }

    const entityId = otp[EntityId]
    await this.repository.remove(entityId)

    return true
  }

  private getExpiresAt() {
    const seconds = this.configService.get('expiresIn', { infer: true })

    return new Date(Date.now() + seconds * 1000)
  }
}
