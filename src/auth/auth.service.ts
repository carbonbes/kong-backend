import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import {
  LogoutOptions,
  SignInOptions,
  SignUpOptions,
  UpdateOptions,
  VerifyOtpOptions,
} from './auth.types'
import { Transactional } from 'typeorm-transactional'
import { OtpsService } from '../otps/otps.service'
import { OtpType } from '../otps/otp.enum'
import { JwtsService } from '../jwts/jwts.service'

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

  update(credentials: UpdateOptions) {
    return this.jwtsService.rotate(credentials)
  }

  logout(credentials: LogoutOptions) {
    credentials.map(async (jwt) => await this.jwtsService.revoke(jwt))
  }
}
