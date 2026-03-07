import { Injectable } from '@nestjs/common'
import {
  CreateOptions,
  CreateReturn,
  type OtpsModuleOptions,
  RedeemOptions,
  RedeemReturn,
  OtpTimeStepSchema,
} from '@/otps/types'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectOtpsModuleOptions } from '@/otps/decorators'
import { generate, verify } from 'otplib'
import { OTP_CREATED } from '@/otps/consts'
import { OtpCreatedEvent } from '@/otps/events'
import { InjectRedisOmRepository } from '@/redis-om/decorators'
import { Repository } from 'redis-om'
import { otpTimeStepSchema } from '@/otps/schemas'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRedisOmRepository(otpTimeStepSchema)
    private readonly repository: Repository<OtpTimeStepSchema>,
    @InjectOtpsModuleOptions()
    private readonly options: Required<OtpsModuleOptions>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create({ type, email }: CreateOptions): CreateReturn {
    const token = await generate({ secret: this.options.secret })
    this.eventEmitter.emit(
      OTP_CREATED,
      new OtpCreatedEvent({ token, type, email }),
    )

    return token
  }

  async redeem({ token, email }: RedeemOptions): RedeemReturn {
    const result = await verify({
      secret: this.options.secret,
      token,
    })

    if (!result.valid) {
      return false
    }

    const { timeStep } = result

    await this.repository.save({ email, timeStep })

    return true
  }
}
