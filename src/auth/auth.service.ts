import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import {
  AccessJwtPayload,
  SignJwtInput,
  RefreshJwtPayload,
  SignInInput,
  SignUpInput,
  VerifyOtpInput,
} from './interface'
import { Transactional } from 'typeorm-transactional'
import { OtpsService } from '../otps/otps.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { OtpType } from '../otps/enum'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly otpsService: OtpsService,
    private readonly jwtService: JwtService,
  ) {}

  private async signJwt({ email }: SignJwtInput) {
    const accessTokenExpiresIn = this.configService.get<string>(
      'JWT_SIGN_OPTIONS_ACCESS_TOKEN_EXPIRES_IN',
    )

    const refreshTokenExpiresIn = this.configService.get<string>(
      'JWT_SIGN_OPTIONS_REFRESH_TOKEN_EXPIRES_IN',
    )

    const user = await this.usersService.findOneBy({ email })

    const jwtPayload = { sub: user.id, user }

    const accessJwtPayload: AccessJwtPayload = {
      ...jwtPayload,
      type: 'access_token',
    }

    const refreshJwtPayload: RefreshJwtPayload = {
      ...jwtPayload,
      type: 'refresh_token',
    }

    const access_token = this.jwtService.sign(accessJwtPayload, {
      expiresIn: accessTokenExpiresIn,
    })

    const refresh_token = this.jwtService.sign(refreshJwtPayload, {
      expiresIn: refreshTokenExpiresIn,
    })

    return { access_token, refresh_token }
  }

  @Transactional()
  async signUp(data: SignUpInput) {
    const user = await this.usersService.create(data)
    const otp = await this.otpsService.create({ type: OtpType.SIGN_UP, user })

    return { otp }
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

    const otp = await this.otpsService.create({ type: OtpType.SIGN_IN, user })

    return { otp }
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

    return await this.signJwt({ email })
  }
}
