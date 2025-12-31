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
  SignInReturn,
  SignUpOptions,
  SignUpReturn,
  VerifyOtpOptions,
} from './auth.types'
import { Transactional } from '@transactional/core'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/otps.enums'
import { JwtsService } from '@/jwts/jwts.service'
import { MailService } from '@/mail/mail.service'
import getDecodedJwt from '@/shared/utils/getDecodedJwt'
import { CookieOptions } from 'express'

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
  async verifyOtp({ body: otp, res }: VerifyOtpOptions) {
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

    this.setJwtCookies({ jwts, res })
  }

  async rotate({ jwts, res }: RotateOptions) {
    const newJwts = await this.jwtsService.rotate(jwts)

    this.setJwtCookies({ jwts: newJwts, res })
  }

  async logout({ jwts, res }: LogoutOptions) {
    this.clearJwtCookies({ jwts, res })
  }

  private setJwtCookies({ jwts, res }: SetJwtCookiesOptions) {
    Object.entries(jwts).forEach(([name, value]) => {
      const { exp } = getDecodedJwt(value)

      const options: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(exp * 1000),
      }

      res.cookie(name, value, options)
    })
  }

  private clearJwtCookies({ jwts, res }: ClearJwtCookiesOptions) {
    Object.keys(jwts).forEach((name) => res.clearCookie(name))
  }
}
