import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { SignInInput, SignUpInput } from './interface'
import { Transactional } from 'typeorm-transactional'
import { OtpsService } from '../otps/otps.service'
import { VerifyOtpInput } from 'src/otps/interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpsService: OtpsService,
  ) {}

  @Transactional()
  async signUp(data: SignUpInput) {
    const user = await this.usersService.create(data)
    const otp = await this.otpsService.createSignUpOtp({ user })

    return { user, otp }
  }

  @Transactional()
  async signIn({ email }: SignInInput) {
    const user = await this.usersService.findOneBy({ email })

    if (!user) {
      throw new NotFoundException('Пользователя с такой почтой не существует')
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь не активирован')
    }

    const otp = await this.otpsService.createSignInOtp({ user })

    return { user, otp }
  }

  @Transactional()
  async verifyOtp(data: VerifyOtpInput) {
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
  }
}
