import { Injectable } from '@nestjs/common'
import { InjectRedisOmRepository } from '@/redis-om/decorators'
import { otpSchema } from '@/otps/schemas'
import { EntityId, Repository } from 'redis-om'
import {
  CreateOptions,
  CreateReturn,
  OtpSchema,
  VerifyOptions,
  VerifyReturn,
} from '@/otps/types'
import { ConfigService } from '@nestjs/config'
import { NanoidService } from '@/nanoid/nanoid.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { OTP_CREATED } from '@/otps/consts'
import { OtpCreatedEvent } from '@/otps/events/otp-created.event'
import { HashService } from '@/hash/hash.service'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRedisOmRepository(otpSchema)
    private readonly repository: Repository<OtpSchema>,
    private readonly nanoidService: NanoidService,
    private readonly hashService: HashService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create({ type, email }: CreateOptions): CreateReturn {
    const code = this.nanoidService.customAlphabet()
    const hashedCode = this.hashService.generate({ value: code })

    const otp = await this.repository.save({ code: hashedCode, type, email })

    const entityId = otp[EntityId]!
    const expiresIn = Number(this.configService.get('otp.expiresIn'))
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await this.repository.expireAt(entityId, expiresAt)
    this.eventEmitter.emit(OTP_CREATED, new OtpCreatedEvent({ ...otp, code }))

    return { ...otp, code }
  }

  async verify({ code, type, email }: VerifyOptions): VerifyReturn {
    const hashedCode = this.hashService.generate({ value: code })

    const otp = await this.repository
      .search()
      .where('code')
      .eq(hashedCode)
      .returnFirst()

    if (!otp || otp.type !== type || otp.email !== email) {
      return false
    }

    const entityId = otp[EntityId]!
    await this.repository.remove(entityId)

    return true
  }
}
