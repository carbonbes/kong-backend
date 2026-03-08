import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import type {
  LogoutOptions,
  LogoutReturn,
  SignInOptions,
  SignInReturn,
  SignUpOptions,
  SignUpReturn,
  UpdateOptions,
  UpdateReturn,
  VerifyOtpOptions,
  VerifyOtpReturn,
} from './types'
import { Transactional } from '@transactional/core'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/enums'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpsService: OtpsService,
    private readonly authJwtsService: AuthJwtsService,
  ) {}

  @Transactional()
  async signUp(options: SignUpOptions): SignUpReturn {
    const { email } = options

    const isExist = await this.usersService.isExist({
      where: { email },
    })

    if (isExist) {
      throw new ForbiddenException()
    }

    await this.usersService.create(options)
    await this.otpsService.create({ type: OtpType.SIGN_UP, email })
  }

  @Transactional()
  async signIn(options: SignInOptions): SignInReturn {
    const { email } = options

    const user = await this.usersService.findOne({ where: { email } })

    if (!user || (user && !user.isActive)) {
      throw new ForbiddenException()
    }

    await this.otpsService.create({ type: OtpType.SIGN_IN, email })
  }

  @Transactional()
  async verifyOtp(options: VerifyOtpOptions): VerifyOtpReturn {
    const isVerify = await this.otpsService.verify(options)

    if (!isVerify) {
      throw new NotFoundException()
    }

    const { type, email } = options

    if (type === 'SIGN_UP') {
      await this.usersService.setActive({
        where: { email },
        value: true,
      })
    }

    return this.authJwtsService.sign({ sub: email })
  }

  update(options: UpdateOptions): UpdateReturn {
    return this.authJwtsService.rotate(options)
  }

  logout(options: LogoutOptions): LogoutReturn {
    return this.authJwtsService.revoke(options)
  }
}
