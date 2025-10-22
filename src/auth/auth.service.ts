import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from '../users/users.service'
import {
  GetJwtCookieOptionsOptions,
  LogoutOptions,
  SetJwtCookieOptions,
  SetJwtsCookieOptions,
  SignInOptions,
  SignUpOptions,
  RotateOptions,
  VerifyOtpOptions,
} from './auth.types'
import { Transactional } from 'typeorm-transactional'
import { OtpsService } from '../otps/otps.service'
import { OtpType } from '../otps/otp.enum'
import { JwtsService } from '../jwts/jwts.service'
import { CookieOptions, Response } from 'express'
import { CREDENTIALS } from './auth.consts'
import { TokenName } from '../shared/types/jwt.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpsService: OtpsService,
    private readonly jwtsService: JwtsService,
  ) {}

  @Transactional()
  async signUp(data: SignUpOptions) {
    const user = await this.usersService.create(data)
    const otp = await this.otpsService.create({
      type: OtpType.SIGN_UP,
      user,
    })

    return { otp }
  }

  @Transactional()
  async signIn({ email }: SignInOptions) {
    const user = await this.usersService.findOneBy({ email })

    if (!user) {
      throw new NotFoundException()
    }

    if (!user.isActive) {
      throw new ForbiddenException()
    }

    const otp = await this.otpsService.create({
      type: OtpType.SIGN_IN,
      user,
    })

    return { otp }
  }

  @Transactional()
  async verifyOtp(data: VerifyOtpOptions) {
    const isVerify = await this.otpsService.verify(data)

    if (!isVerify) {
      throw new NotFoundException()
    }

    const { type, email } = data

    if (type === 'SIGN_UP') {
      await this.usersService.activate({ email })
    }

    const { id } = await this.usersService.findOneBy({ email })

    return this.jwtsService.sign(id)
  }

  rotate(jwts: RotateOptions) {
    return this.jwtsService.rotate(jwts)
  }

  logout(credentials: LogoutOptions) {
    Object.values(credentials).forEach((credential) =>
      this.jwtsService.revoke(credential),
    )
  }

  setCredentialCookies({ res, credentials }: SetJwtsCookieOptions) {
    CREDENTIALS.forEach((tokenName: TokenName) => {
      this.setCredentialCookie({
        res,
        name: tokenName,
        credential: credentials[tokenName],
      })
    })
  }

  removeCredentialCookies(res: Response) {
    CREDENTIALS.forEach((tokenName) => {
      res.clearCookie(tokenName)
    })
  }

  private getCredentialCookieOptions(exp: GetJwtCookieOptionsOptions) {
    const expires = new Date(exp * 1000)

    const options: CookieOptions = {
      path: '/auth',
      sameSite: 'strict',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires,
    }

    return options
  }

  private setCredentialCookie({ res, name, credential }: SetJwtCookieOptions) {
    const { exp } = this.jwtsService.decode(credential)

    const options = this.getCredentialCookieOptions(exp)

    res.cookie(name, credential, options)
  }
}
