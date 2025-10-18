import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import {
  GetJwtCookieOptionsOptions,
  LogoutOptions,
  SetJwtCookieOptions,
  SetJwtsCookieOptions,
  SignInOptions,
  SignUpOptions,
  UpdateOptions,
  VerifyOtpOptions,
} from './auth.types'
import { Transactional } from 'typeorm-transactional'
import { OtpsService } from '../otps/otps.service'
import { OtpType } from '../otps/otp.enum'
import { JwtsService } from '../jwts/jwts.service'
import { CookieOptions, Response } from 'express'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../shared/consts'

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

  update(jwts: UpdateOptions) {
    return this.jwtsService.rotate(jwts)
  }

  logout(jwts: LogoutOptions) {
    jwts.map(async (jwt) => await this.jwtsService.revoke(jwt))
  }

  setJwtsCookie({
    res,
    jwts: { access_token, refresh_token },
  }: SetJwtsCookieOptions) {
    this.setJwtCookie({ res, name: ACCESS_TOKEN_NAME, jwt: access_token })
    this.setJwtCookie({ res, name: REFRESH_TOKEN_NAME, jwt: refresh_token })
  }

  removeJwtsCookie(res: Response) {
    res.clearCookie(ACCESS_TOKEN_NAME)
    res.clearCookie(REFRESH_TOKEN_NAME)
  }

  private getJwtCookieOptions(exp: GetJwtCookieOptionsOptions) {
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

  private setJwtCookie({ res, name, jwt }: SetJwtCookieOptions) {
    const { exp } = this.jwtsService.decode(jwt)

    const options = this.getJwtCookieOptions(exp)

    res.cookie(name, jwt, options)
  }
}
