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
  VerifyOtpOptions,
} from './auth.interface'
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
      throw new NotFoundException('Пользователя с такой почтой не существует')
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь не активирован')
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
      throw new NotFoundException(
        'Код не найден, или у него истек срок действия',
      )
    }

    const { type, email } = data

    if (type === 'SIGN_UP') {
      await this.usersService.activate({ email })
    }

    const { id } = await this.usersService.findOneBy({ email })

    return await this.jwtsService.sign(id)
  }

  async logout({ email }: LogoutOptions) {}

  async update(authorization: string) {
    const jwt = authorization.split(' ')[1]

    return jwt
  }
}
