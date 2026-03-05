import { Injectable } from '@nestjs/common'
import { InjectRedisOmRepository } from '@/redis-om/decorators'
import { otpSchema } from '@/otps/schemas'
import { EntityId, Repository } from 'redis-om'
import {
  CreateOptions,
  CreateReturn,
  Otp,
  VerifyOptions,
  VerifyReturn,
} from '@/otps/types'
import { ConfigService } from '@nestjs/config'
import { NanoidService } from '@/shared/nanoid/nanoid.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { OTP_CREATED } from '@/events/otp-created/consts'
import { OtpCreatedEvent } from '@/events/otp-created/otp-created.event'
import { AesService } from '@/aes/aes.service'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRedisOmRepository(otpSchema)
    private readonly repository: Repository<Otp>,
    private readonly nanoidService: NanoidService,
    private readonly aesService: AesService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create({ type, email }: CreateOptions): CreateReturn {
    const code = this.nanoidService.customAlphabet()
    const encryptedCode = this.aesService.encrypt({ value: code })

    const otp = await this.repository.save({
      code: encryptedCode,
      type,
      email,
    })

    const entityId: string = otp[EntityId]
    const expiresIn = Number(this.configService.get('otp.expiresIn'))
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await this.repository.expireAt(entityId, expiresAt)

    this.eventEmitter.emit(OTP_CREATED, {
      email,
      code,
      type,
    } as OtpCreatedEvent)

    return { ...otp, code }
  }

  async verify({ code, type, email }: VerifyOptions): VerifyReturn {
    const encryptedCode = this.aesService.encrypt({ value: code })

    const otp = await this.repository
      .search()
      .where('code')
      .eq(encryptedCode)
      .returnFirst()

    if (!otp || (otp && otp.type !== type && otp.email !== email)) {
      return false
    }

    const entityId: string = otp[EntityId]
    await this.repository.remove(entityId)

    return true
  }
}
