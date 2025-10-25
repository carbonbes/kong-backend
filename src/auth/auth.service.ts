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
import { Transactional } from '@takeny1998/nestjs-prisma-transactional'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/otps.enum'
import { JwtsService } from '@/jwts/jwts.service'
import getCode from '@/shared/utils/getCode'

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

    const code = getCode()
    const user = await this.usersService.create(data)
    const expiresAt = new Date(Date.now() + 300 * 1000)

    return this.otpsService.create({
      otp: code,
      type: OtpType.SIGN_UP,
      user,
      expiresAt,
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

    const code = getCode()
    const expiresAt = new Date(Date.now() + 300 * 1000)

    return this.otpsService.create({
      otp: code,
      type: OtpType.SIGN_IN,
      user,
      expiresAt,
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

  logout(credentials: LogoutOptions) {
    Object.values(credentials).forEach((credential) =>
      this.jwtsService.revoke(credential),
    )
  }
}
