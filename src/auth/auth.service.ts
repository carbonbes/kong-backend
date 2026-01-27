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
  SignInReturn,
  SignUpOptions,
  SignUpReturn,
  VerifyOtpOptions,
} from './auth.types'
import { Transactional } from '@transactional/core'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/otps.enums'
import { JwtsService } from '@/jwts/jwts.service'
import { MailService } from '@/shared/mail/mail.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly otpsService: OtpsService,
    private readonly jwtsService: JwtsService,
  ) {}

  @Transactional()
  async signUp(data: SignUpOptions): SignUpReturn {
    const { email } = data

    const isExist = await this.usersService.isExist({
      where: { email },
    })

    if (isExist) {
      return null
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

    return { otpId, userId }
  }

  @Transactional()
  async signIn({ email }: SignInOptions): SignInReturn {
    const user = await this.usersService.findOne({ where: { email } })

    if (!user) {
      return null
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

    return { otpId, userId }
  }

  @Transactional()
  async verifyOtp(otp: VerifyOtpOptions) {
    const isVerify = await this.otpsService.verify(otp)

    if (!isVerify) {
      throw new NotFoundException()
    }

    const { type, userId } = otp

    if (type === 'SIGN_UP') {
      await this.usersService.setActive({
        where: { id: userId },
        value: true,
      })
    }

    return this.jwtsService.sign({ sub: userId })
  }

  rotate(jwts: RotateOptions) {
    return this.jwtsService.rotate(jwts)
  }

  async logout(jwts: LogoutOptions) {
    Object.values(jwts).forEach((jwt) => this.jwtsService.revoke({ jwt }))
  }
}
