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
import { OTP_CREATED } from '@/events/otp-created/consts'
import { OtpCreatedEvent } from '@/events/otp-created/otp-created.event'
import { UuidService } from '@/shared/uuid/uuid.service'
import { BcryptService } from '@/bcrypt/bcrypt.service'

@Injectable()
export class OtpsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRedisOmRepository(otpSchema)
    private readonly repository: Repository<OtpSchema>,
    private readonly uuidService: UuidService,
    private readonly nanoidService: NanoidService,
    private readonly bcryptService: BcryptService,
  ) {}

  async create({ type, email }: CreateOptions): CreateReturn {
    const id = this.uuidService.generate()
    const code = this.nanoidService.customAlphabet()
    const hashedCode = await this.bcryptService.hash({ value: code })

    const otp = await this.repository.save({
      id,
      code: hashedCode,
      type,
      email,
    })

    const entityId = otp[EntityId]!
    const expiresIn = Number(this.configService.get('otp.expiresIn'))
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await this.repository.expireAt(entityId, expiresAt)

    this.eventEmitter.emit(OTP_CREATED, new OtpCreatedEvent({ ...otp, code }))

    return { ...otp, code }
  }

  async verify({ id, code, type, email }: VerifyOptions): VerifyReturn {
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

    const isCompared = await this.bcryptService.compare({
      value: code,
      hash: otp.code,
    })

    if (!isCompared) {
      return false
    }

    const entityId = otp[EntityId]!
    await this.repository.remove(entityId)

    return true
  }
}
