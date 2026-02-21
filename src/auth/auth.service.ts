import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UsersService } from '@/users/users.service'
import {
  AuthJwts,
  LogoutOptions,
  RevokeJwtOptions,
  RevokeJwtsOptions,
  RotateJwtsOptions,
  RotateJwtsReturn,
  SignInOptions,
  SignInReturn,
  SignJwtsOptions,
  SignJwtsReturn,
  SignUpOptions,
  SignUpReturn,
  UpdateOptions,
  VerifyOtpOptions,
  VerifyOtpReturn,
} from './auth.types'
import { Transactional } from '@transactional/core'
import { OtpsService } from '@/otps/otps.service'
import { OtpType } from '@/otps/otps.enums'
import { MailService } from '@/shared/mail/mail.service'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly otpsService: OtpsService,
    private readonly accessJwtService: AccessJwtService,
    private readonly refreshJwtService: RefreshJwtService,
    private readonly signedJwtsService: SignedJwtsService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {}

  @Transactional()
  async signUp(data: SignUpOptions): SignUpReturn {
    const { email } = data

    const isExist = await this.usersService.isExist({
      where: { email },
    })

    if (isExist) {
      throw new ForbiddenException()
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
      throw new ForbiddenException()
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
  async verifyOtp(otp: VerifyOtpOptions): VerifyOtpReturn {
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

    return this.signJwts({ sub: userId })
  }

  update(jwt: UpdateOptions) {
    return this.rotateJwts(jwt)
  }

  logout(jwts: LogoutOptions) {
    return this.revokeJwts(jwts)
  }

  private async signJwts({ sub }: SignJwtsOptions): SignJwtsReturn {
    const jwts: AuthJwts = {
      [ACCESS_TOKEN_NAME]: this.accessJwtService.sign({ sub }),
      [REFRESH_TOKEN_NAME]: this.refreshJwtService.sign({ sub }),
    }

    await Promise.all([
      Object.values(jwts).map(async (jwt, i) => {
        const { jti, sub, exp } =
          i === 0
            ? this.accessJwtService.decode(jwt)
            : this.refreshJwtService.decode(jwt)

        await this.signedJwtsService.add({ jti, sub, exp })
      }),
    ])

    return jwts
  }

  private async revokeJwt({ jwt, type }: RevokeJwtOptions) {
    const { jti, sub, exp } =
      type === ACCESS_TOKEN_NAME
        ? this.accessJwtService.verify(jwt)
        : this.refreshJwtService.verify(jwt)

    await this.revokedJwtsService.add({ jti, sub, exp })
  }

  private async revokeJwts(jwts: RevokeJwtsOptions) {
    await Promise.all([
      Object.values(jwts).map(async (jwt, i) => {
        const type = i === 0 ? ACCESS_TOKEN_NAME : REFRESH_TOKEN_NAME

        await this.revokeJwt({ jwt, type })
      }),
    ])
  }

  private async rotateJwts(jwt: RotateJwtsOptions): RotateJwtsReturn {
    await this.revokeJwt({ jwt, type: REFRESH_TOKEN_NAME })

    const { sub } = this.refreshJwtService.decode(jwt)

    return this.signJwts({ sub })
  }
}
