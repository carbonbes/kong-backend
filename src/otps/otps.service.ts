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

  async create({ type, userId }: CreateOptions): Promise<Otp> {
    const id = getUuid()
    const code = getCode()
    const codeHash = await getHash({ value: code })

    const otp = await this.repository.save({
      id,
      code: codeHash,
      type,
      userId,
    })

    const entityId = otp[EntityId]
    const expiresAt = this.getExpiresAt()
    await this.repository.expireAt(entityId, expiresAt)

    return { ...otp, code }
  }

  async verify({ id, code, type, userId }: VerifyOptions): Promise<boolean> {
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

    const isVerify = await compare({ value: code, hash: otp.code })
    if (!isVerify) {
      return false
    }

    const entityId = otp[EntityId]
    await this.repository.remove(entityId)

    return true
  }

  private getExpiresAt(): Date {
    const seconds = Number(this.configService.get('OTP_EXPIRES_IN'))

    return new Date(Date.now() + seconds * 1000)
  }
}
