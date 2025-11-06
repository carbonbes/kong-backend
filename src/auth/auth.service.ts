import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import {
  ClearJwtCookiesOptions,
  LogoutOptions,
  RotateOptions,
  SetJwtCookiesOptions,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from './auth.types'
import { Transactional } from '@transactional/core'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/otps.enums'
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
  async verifyOtp({ otp, response }: VerifyOtpOptions) {
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

    const jwts = await this.jwtsService.sign({ sub: userId })

    this.setJwtCookies({ jwts, response })
  }

  async rotate({ jwts, response }: RotateOptions) {
    const newJwts = await this.jwtsService.rotate(jwts)

    this.setJwtCookies({ jwts: newJwts, response })
  }

  logout({ jwts, response }: LogoutOptions) {
    this.clearJwtCookies({ jwts, response })
  }

  private setJwtCookies({ jwts, response }: SetJwtCookiesOptions) {
    Object.entries(jwts).forEach((jwt) => {
      const [name, value] = jwt

      response.cookie(name, value)
    })
  }

  private clearJwtCookies({ jwts, response }: ClearJwtCookiesOptions) {
    Object.keys(jwts).forEach((name) => response.clearCookie(name))
  }
}
