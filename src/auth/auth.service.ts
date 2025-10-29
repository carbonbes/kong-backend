import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import {
  LogoutOptions,
  RotateOptions,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from './types'
import { Transactional } from '@transactional/core'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/enums'
import { JwtsService } from '@/jwts/jwts.service'
import { MailService } from '@/mail/mail.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly otpsService: OtpsService,
    private readonly jwtsService: JwtsService,
  ) {}

  @Transactional()
  async signUp(data: SignUpOptions) {
    const { email } = data

    const isExist = await this.usersService.isExist({
      where: { email },
    })

    if (isExist) {
      return
    }

    const { id: userId } = await this.usersService.create(data)

    const {
      id: otpId,
      code,
      type,
    } = await this.otpsService.create({
      type: OtpType.SIGN_UP,
      userId,
    })

    await this.mailService.sendOtp({ email, code, type })

    return { id: otpId, userId }
  }

  @Transactional()
  async signIn({ email }: SignInOptions) {
    const user = await this.usersService.findOne({ where: { email } })

    if (!user) {
      return
    }

    if (!user.isActive) {
      throw new ForbiddenException()
    }

    const { id: userId } = user

    const {
      id: otpId,
      code,
      type,
    } = await this.otpsService.create({
      type: OtpType.SIGN_IN,
      userId,
    })

    await this.mailService.sendOtp({ email, code, type })

    return { id: otpId, userId }
  }

  @Transactional()
  async verifyOtp(data: VerifyOtpOptions) {
    const isVerify = await this.otpsService.verify(data)

    if (!isVerify) {
      throw new NotFoundException()
    }

    const { type, userId } = data

    if (type === 'SIGN_UP') {
      await this.usersService.update({
        where: { id: userId },
        data: { isActive: true },
      })
    }

    return this.jwtsService.sign(userId)
  }

  rotate(jwts: RotateOptions) {
    return this.jwtsService.rotate(jwts)
  }

  logout(jwts: LogoutOptions) {
    Object.values(jwts).forEach((jwt) => this.jwtsService.revoke(jwt))
  }
}
