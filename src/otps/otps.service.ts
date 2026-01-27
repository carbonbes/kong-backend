import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/shared/redis/redis.utils'
import { otpSchema } from '@/otps/otps.schema'
import { EntityId, Repository } from 'redis-om'
import { CreateOptions, Otp, VerifyOptions } from '@/otps/otps.types'
import { ConfigService } from '@nestjs/config'
import { BcryptService } from '@/shared/bcrypt/bcrypt.service'
import { NanoidService } from '@/shared/nanoid/nanoid.service'
import { UuidService } from '@/shared/uuid/uuid.service'

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(otpSchema)
    private readonly repository: Repository<Otp>,
    private readonly uuidService: UuidService,
    private readonly nanoidService: NanoidService,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
  ) {}

  async create({ type, userId }: CreateOptions) {
    const id = this.uuidService.generate()
    const code = this.nanoidService.customAlphabet()
    const codeHash = await this.bcryptService.hash({ value: code })

    const otp = await this.repository.save({
      id,
      code: codeHash,
      type,
      userId,
    })

    const entityId: string = otp[EntityId]
    const expiresIn = this.configService.get<number>('otp.expiresIn')!
    const expiresAt = new Date((Date.now() + expiresIn) * 1000)

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

    const entityId: string = otp[EntityId]
    await this.repository.remove(entityId)

    return true
  }
}
