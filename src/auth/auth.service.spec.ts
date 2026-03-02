import { AuthService } from '@/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '@/users/users.service'
import { MailService } from '@/shared/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import {
  getFakeAuthJwts,
  getFakeJwt,
  getFakeOtp,
  getFakeStoragedJwt,
  getFakeUser,
  getFakeUuid,
} from '@/test/utils'
import { OtpType } from '@/otps/otps.enums'
import {
  AuthJwts,
  LoginReturn,
  SignInOptions,
  SignUpOptions,
} from '@/auth/types'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { mock, MockProxy } from 'vitest-mock-extended'
import {
  CreateOptions as UsersServiceCreateOptions,
  FindOneOptions as UsersServiceFindOneOptions,
  IsExistOptions as UsersServiceIsExistOptions,
  SetActiveOptions as UsersServiceSetActiveOptions,
} from '@/users/users.types'
import { CreateOptions as OtpsServiceCreateOptions } from '@/otps/otps.types'
import { SendOtpOptions as MailServiceSendOtpOptions } from '@/shared/mail/mail.types'
import { AddOptions as JwtStorageAddOptions } from '@/shared/jwt-storage/jwt-storage.types'
import { SignOptions as AuthJwtSignOptions } from '@/shared/auth-jwt/auth-jwt.types'
import { JwtPayload } from '@/shared/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { getDecodedJwt } from '@/shared/utils'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: MockProxy<UsersService>
  let mailService: MockProxy<MailService>
  let otpsService: MockProxy<OtpsService>
  let accessJwtService: MockProxy<AccessJwtService>
  let refreshJwtService: MockProxy<RefreshJwtService>
  let signedJwtsService: MockProxy<SignedJwtsService>
  let revokedJwtsService: MockProxy<RevokedJwtsService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(mock)
      .compile()

    authService = module.get<AuthService>(AuthService)
    usersService = module.get<MockProxy<UsersService>>(UsersService)
    mailService = module.get<MockProxy<MailService>>(MailService)
    otpsService = module.get<MockProxy<OtpsService>>(OtpsService)
    accessJwtService = module.get<MockProxy<AccessJwtService>>(AccessJwtService)
    refreshJwtService = module.get<MockProxy<RefreshJwtService>>(RefreshJwtService)
    signedJwtsService = module.get<MockProxy<SignedJwtsService>>(SignedJwtsService)
    revokedJwtsService = module.get<MockProxy<RevokedJwtsService>>(RevokedJwtsService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    let options: SignUpOptions

    beforeEach(() => {
      const { email, name, gender } = getFakeUser()
      options = { email, name, gender }
    })

    test('should be return a user ID and otp ID if a user with that email not exist', async () => {
      const user = getFakeUser({ ...options })
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      usersService.isExist.mockResolvedValue(false)
      usersService.create.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)
      mailService.sendOtp.mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }
      const usersServiceIsExistOptions: UsersServiceIsExistOptions = {
        where: { email: user.email },
      }
      const usersServiceCreateOptions: UsersServiceCreateOptions = options
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: otp.type,
        userId: user.id,
      }
      const mailServiceSendOtpOptions: MailServiceSendOtpOptions = {
        email: user.email,
        code: otp.code,
        type: otp.type,
      }

      expect(await authService.signUp(options)).toEqual(result)
      expect(usersService.isExist).toHaveBeenCalledWith(
        usersServiceIsExistOptions,
      )
      expect(usersService.create).toHaveBeenCalledWith(
        usersServiceCreateOptions,
      )
      expect(otpsService.create).toHaveBeenCalledWith(otpsServiceCreateOptions)
      expect(mailService.sendOtp).toHaveBeenCalledWith(
        mailServiceSendOtpOptions,
      )
    })

    test('should be return 403 if a user with that email exists', async () => {
      const user = getFakeUser({ ...options })

      usersService.isExist.mockResolvedValue(true)

      const userIsExistOptions: UsersServiceIsExistOptions = {
        where: { email: user.email },
      }

      await expect(authService.signUp(options)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.isExist).toHaveBeenCalledWith(userIsExistOptions)
    })
  })

  describe('signIn', () => {
    let options: SignInOptions

    beforeEach(() => {
      const { email } = getFakeUser()
      options = { email }
    })

    test('should be return a user ID and otp ID if a user with that email has exist and user is active', async () => {
      const user = getFakeUser({ ...options, isActive: true })
      const otp = getFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      usersService.findOne.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)
      mailService.sendOtp.mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: otp.type,
        userId: user.id,
      }
      const mailServiceSendOtpOptions: MailServiceSendOtpOptions = {
        email: user.email,
        code: otp.code,
        type: otp.type,
      }

      expect(await authService.signIn(options)).toEqual(result)
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
      expect(otpsService.create).toHaveBeenCalledWith(otpsServiceCreateOptions)
      expect(mailService.sendOtp).toHaveBeenCalledWith(
        mailServiceSendOtpOptions,
      )
    })

    test('should be return a 403 if a user with that email does not exist', async () => {
      const user = getFakeUser({ ...options })
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }

      usersService.findOne.mockResolvedValue(null)

      await expect(authService.signIn(options)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
    })

    test('should be return a 403 if a user with that email does not active', async () => {
      const user = getFakeUser({ ...options, isActive: false })
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }

      usersService.findOne.mockResolvedValue(user)

      await expect(authService.signIn(options)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
    })
  })

  describe('verifyOtp', () => {
    test('should be return auth-jwts if such an OTP exists and type is SIGN_UP', async () => {
      const user = getFakeUser()
      const otp = getFakeOtp({ userId: user.id, type: OtpType.SIGN_UP })
      const authJwts = getFakeAuthJwts({
        accessJwtOptions: { payload: { sub: user.id } },
        refreshJwtOptions: { payload: { sub: user.id } },
      })
      const encodedAccessJwt = authJwts[ACCESS_TOKEN_NAME]
      const encodedRefreshJwt = authJwts[REFRESH_TOKEN_NAME]
      const decodedAccessJwt = getDecodedJwt(encodedAccessJwt)
      const decodedRefreshJwt = getDecodedJwt(encodedRefreshJwt)
      const storagedJwt = getFakeStoragedJwt({ jti: sub: user.id })

      otpsService.verify.mockResolvedValue(true)
      accessJwtService.sign.mockReturnValue(encodedAccessJwt)
      refreshJwtService.sign.mockReturnValue(encodedRefreshJwt)
      accessJwtService.decode.mockReturnValue(decodedAccessJwt)
      refreshJwtService.decode.mockReturnValue(decodedRefreshJwt)
      signedJwtsService.add.mockResolvedValue(storagedJwt)

      const usersServiceSetActiveOptions: UsersServiceSetActiveOptions = {
        where: { id: user.id },
        value: true,
      }
      const accessJwtSignOptions: AuthJwtSignOptions = { sub: user.id }
      const refreshJwtSignOptions: AuthJwtSignOptions = { sub: user.id }
      const accessJwtStorageAddOptions: JwtStorageAddOptions = {
        jti: decodedAccessJwt.jti,
        sub: decodedAccessJwt.sub,
        exp: decodedAccessJwt.exp,
      }
      const refreshJwtStorageAddOptions: JwtStorageAddOptions = {
        jti: decodedRefreshJwt.jti,
        sub: decodedRefreshJwt.sub,
        exp: decodedRefreshJwt.exp,
      }

      const result = await authService.verifyOtp(otp)

      expect(result).toEqual(authJwts)
      expect(otpsService.verify).toHaveBeenCalledWith(otp)
      expect(usersService.setActive).toHaveBeenCalledWith(
        usersServiceSetActiveOptions,
      )
      expect(accessJwtService.sign).toHaveBeenCalledWith(accessJwtSignOptions)
      expect(refreshJwtService.sign).toHaveBeenCalledWith(refreshJwtSignOptions)
      expect(signedJwtsService.add).toHaveBeenCalledWith(
        accessJwtStorageAddOptions,
      )
      expect(signedJwtsService.add).toHaveBeenCalledWith(
        refreshJwtStorageAddOptions,
      )
    })

    test('should be return auth-jwts without activating user if type is SIGN_IN', async () => {
      const user = getFakeUser()
      const otp = getFakeOtp({ userId: user.id, type: OtpType.SIGN_IN })
      const authJwts = getFakeAuthJwts({
        accessJwtOptions: { payload: { sub: user.id } },
        refreshJwtOptions: { payload: { sub: user.id } },
      })
      const encodedAccessJwt = authJwts[ACCESS_TOKEN_NAME]
      const encodedRefreshJwt = authJwts[REFRESH_TOKEN_NAME]
      const decodedAccessJwt = getDecodedJwt(encodedAccessJwt)
      const decodedRefreshJwt = getDecodedJwt(encodedRefreshJwt)
      const storagedJwt = getFakeStoragedJwt({ sub: user.id })

      otpsService.verify.mockResolvedValue(true)
      accessJwtService.sign.mockReturnValue(encodedAccessJwt)
      refreshJwtService.sign.mockReturnValue(encodedRefreshJwt)
      accessJwtService.decode.mockReturnValue(decodedAccessJwt)
      refreshJwtService.decode.mockReturnValue(decodedRefreshJwt)
      signedJwtsService.add.mockResolvedValue(storagedJwt)

      const usersServiceSetActiveOptions: UsersServiceSetActiveOptions = {
        where: { id: user.id },
        value: true,
      }
      const accessJwtSignOptions: AuthJwtSignOptions = { sub: user.id }
      const refreshJwtSignOptions: AuthJwtSignOptions = { sub: user.id }
      const accessJwtStorageAddOptions: JwtStorageAddOptions = {
        jti: decodedAccessJwt.jti,
        sub: decodedAccessJwt.sub,
        exp: decodedAccessJwt.exp,
      }
      const refreshJwtStorageAddOptions: JwtStorageAddOptions = {
        jti: decodedRefreshJwt.jti,
        sub: decodedRefreshJwt.sub,
        exp: decodedRefreshJwt.exp,
      }

      const result = await authService.verifyOtp(otp)

      expect(result).toEqual(authJwts)
      expect(otpsService.verify).toHaveBeenCalledWith(otp)
      expect(usersService.setActive).toHaveBeenCalledWith(
        usersServiceSetActiveOptions,
      )
      expect(accessJwtService.sign).toHaveBeenCalledWith(accessJwtSignOptions)
      expect(refreshJwtService.sign).toHaveBeenCalledWith(refreshJwtSignOptions)
      expect(signedJwtsService.add).toHaveBeenCalledWith(
        accessJwtStorageAddOptions,
      )
      expect(signedJwtsService.add).toHaveBeenCalledWith(
        refreshJwtStorageAddOptions,
      )
    })

    test('should be return a 404 if a OTP not found', async () => {
      const user = getFakeUser()
      const body = getFakeOtp({ userId: user.id, type: OtpType.SIGN_UP })

      otpsService.verify.mockResolvedValue(false)

      await expect(authService.verifyOtp(body)).rejects.toThrow(
        new NotFoundException(),
      )
      expect(otpsService.verify).toHaveBeenCalledWith(body)
    })
  })

  describe('update', () => {
    test('should be return new auth-jwts', async () => {
      const oldRefreshJwt = getFakeJwt({ type: REFRESH_TOKEN_NAME })
      const newJwts = getFakeAuthJwts()
      const oldPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: 1,
        iat: 1,
        exp: 2,
      }
      const accessPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: 1,
        iat: 1,
        exp: 2,
      }
      const refreshPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: 1,
        iat: 1,
        exp: 2,
      }

      refreshJwtService.verify.mockReturnValue(oldPayload)
      revokedJwtsService.add.mockResolvedValue({} as never)
      refreshJwtService.decode.mockReturnValue(oldPayload)
      accessJwtService.sign.mockReturnValue(newJwts[ACCESS_TOKEN_NAME])
      refreshJwtService.sign.mockReturnValue(newJwts[REFRESH_TOKEN_NAME])
      accessJwtService.decode.mockReturnValue(accessPayload)
      refreshJwtService.decode.mockReturnValue(refreshPayload)
      signedJwtsService.add.mockResolvedValue({} as never)

      expect(await authService.update(oldRefreshJwt)).toEqual(newJwts)
    })
  })

  describe('logout', () => {
    test('should be revoke auth-jwts', async () => {
      const jwts: AuthJwts = getFakeAuthJwts()
      const accessPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: 1,
        iat: 1,
        exp: 2,
      }
      const refreshPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: 1,
        iat: 1,
        exp: 2,
      }

      accessJwtService.verify.mockReturnValue(accessPayload)
      refreshJwtService.verify.mockReturnValue(refreshPayload)
      revokedJwtsService.add.mockResolvedValue({} as never)

      expect(await authService.logout(jwts)).toBeUndefined()
    })
  })
})
