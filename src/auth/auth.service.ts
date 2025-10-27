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
} from './auth.types'
import { Transactional } from '@transactional/core'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/enums'
import { JwtsService } from '@/jwts/jwts.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpsService: OtpsService,
    private readonly jwtsService: JwtsService,
  ) {}

  @Transactional()
  async signUp(data: SignUpOptions) {
    const isExist = await this.usersService.findOne({
      where: { email: data.email },
    })

    if (isExist) {
      return
    }

    return this.otpsService.create({
      type: OtpType.SIGN_UP,
      email: data.email,
    })
  }

  @Transactional()
  async signIn({ email }: SignInOptions) {
    const user = await this.usersService.findOne({ where: { email } })

    if (!user) {
      throw new NotFoundException()
    }

    if (!user.isActive) {
      throw new ForbiddenException()
    }

    return this.otpsService.create({
      type: OtpType.SIGN_IN,
      email,
    })
  }

  @Transactional()
  async verifyOtp(data: VerifyOtpOptions) {
    const isVerify = await this.otpsService.verify(data)

    if (!isVerify) {
      throw new NotFoundException()
    }

    const { type, email } = data

    if (type === 'SIGN_UP') {
      await this.usersService.update({
        where: { email },
        data: { isActive: true },
      })
    }

    const { id } = await this.usersService.findOne({ where: { email } })

    return this.jwtsService.sign(id)
  }

  rotate(jwts: RotateOptions) {
    return this.jwtsService.rotate(jwts)
  }

  logout(jwts: LogoutOptions) {
    Object.values(jwts).forEach((jwt) => this.jwtsService.revoke(jwt))
  }
}
