import { AuthService } from '@/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '@/users/users.service'
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
import { OtpType } from '@/otps/enums'
import {
  AuthJwts,
  LoginReturn,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from '@/auth/types'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { mock, MockProxy } from 'vitest-mock-extended'
import {
  CreateOptions as UsersServiceCreateOptions,
  FindOneOptions as UsersServiceFindOneOptions,
  IsExistOptions as UsersServiceIsExistOptions,
  SetActiveOptions as UsersServiceSetActiveOptions,
} from '@/users/types'
import { CreateOptions as OtpsServiceCreateOptions } from '@/otps/types'
import { AddOptions as JwtStorageAddOptions } from '@/shared/jwt-storage/types'
import { SignOptions as AuthJwtSignOptions } from '@/shared/auth-jwt/types'
import { JwtPayload } from '@/shared/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { getDecodedJwt } from '@/shared/utils'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: MockProxy<UsersService>
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
    otpsService = module.get<MockProxy<OtpsService>>(OtpsService)
    accessJwtService = module.get<MockProxy<AccessJwtService>>(AccessJwtService)
    refreshJwtService =
      module.get<MockProxy<RefreshJwtService>>(RefreshJwtService)
    signedJwtsService =
      module.get<MockProxy<SignedJwtsService>>(SignedJwtsService)
    revokedJwtsService =
      module.get<MockProxy<RevokedJwtsService>>(RevokedJwtsService)
  })

  describe('signUp', () => {
    let options: SignUpOptions

    beforeEach(() => {
      const { email, name, gender } = getFakeUser()
      options = { email, name, gender }
    })

    test('should be return a user ID and otp ID if a user not exist', async () => {
      const user = getFakeUser({ ...options })
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, email: user.email })

      usersService.isExist.mockResolvedValue(false)
      usersService.create.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)

      const result: LoginReturn = { otpId: otp.id }
      const usersServiceIsExistOptions: UsersServiceIsExistOptions = {
        where: { email: user.email },
      }
      const usersServiceCreateOptions: UsersServiceCreateOptions = options
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: otp.type,
        email: user.email,
      }

      expect(await authService.signUp(options)).toEqual(result)
      expect(usersService.isExist).toHaveBeenCalledWith(
        usersServiceIsExistOptions,
      )
      expect(usersService.create).toHaveBeenCalledWith(
        usersServiceCreateOptions,
      )
      expect(otpsService.create).toHaveBeenCalledWith(otpsServiceCreateOptions)
    })

    test('should be return 403 if a user has exists', async () => {
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

    test('should be return a user ID and otp ID if a user has exist and user is active', async () => {
      const user = getFakeUser({ ...options, isActive: true })
      const otp = getFakeOtp({ type: OtpType.SIGN_IN, email: user.email })

      usersService.findOne.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)

      const result: LoginReturn = { otpId: otp.id }
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: otp.type,
        email: user.email,
      }

      expect(await authService.signIn(options)).toEqual(result)
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
      expect(otpsService.create).toHaveBeenCalledWith(otpsServiceCreateOptions)
    })

    test('should be return a 403 if a user not exist', async () => {
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

    test('should be return a 403 if a user does not active', async () => {
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
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, email: user.email })
      const authJwts = getFakeAuthJwts({
        accessJwtOptions: { payload: { sub: user.email } },
        refreshJwtOptions: { payload: { sub: user.email } },
      })
      const encodedAccessJwt = authJwts[ACCESS_TOKEN_NAME]
      const encodedRefreshJwt = authJwts[REFRESH_TOKEN_NAME]
      const decodedAccessJwt = getDecodedJwt(encodedAccessJwt)
      const decodedRefreshJwt = getDecodedJwt(encodedRefreshJwt)
      const storagedJwt = getFakeStoragedJwt({ sub: user.email })

      otpsService.verify.mockResolvedValue(true)
      accessJwtService.sign.mockReturnValue(encodedAccessJwt)
      refreshJwtService.sign.mockReturnValue(encodedRefreshJwt)
      accessJwtService.decode.mockReturnValue(decodedAccessJwt)
      refreshJwtService.decode.mockReturnValue(decodedRefreshJwt)
      signedJwtsService.add.mockResolvedValue(storagedJwt)

      const usersServiceSetActiveOptions: UsersServiceSetActiveOptions = {
        where: { email: user.email },
        value: true,
      }
      const accessJwtSignOptions: AuthJwtSignOptions = { sub: user.email }
      const refreshJwtSignOptions: AuthJwtSignOptions = { sub: user.email }
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

    test('should be return auth-jwts if such an OTP exists and type is SIGN_IN', async () => {
      const user = getFakeUser()
      const options: VerifyOtpOptions = getFakeOtp({
        type: OtpType.SIGN_IN,
        email: user.email,
      })

      const authJwts = getFakeAuthJwts({
        accessJwtOptions: { payload: { sub: user.email } },
        refreshJwtOptions: { payload: { sub: user.email } },
      })
      const encodedAccessJwt = authJwts[ACCESS_TOKEN_NAME]
      const encodedRefreshJwt = authJwts[REFRESH_TOKEN_NAME]
      const decodedAccessJwt = getDecodedJwt(encodedAccessJwt)
      const decodedRefreshJwt = getDecodedJwt(encodedRefreshJwt)
      const storagedJwt = getFakeStoragedJwt({ sub: user.email })

      otpsService.verify.mockResolvedValue(true)
      accessJwtService.sign.mockReturnValue(encodedAccessJwt)
      refreshJwtService.sign.mockReturnValue(encodedRefreshJwt)
      accessJwtService.decode.mockReturnValue(decodedAccessJwt)
      refreshJwtService.decode.mockReturnValue(decodedRefreshJwt)
      signedJwtsService.add.mockResolvedValue(storagedJwt)

      const accessJwtSignOptions: AuthJwtSignOptions = { sub: user.email }
      const refreshJwtSignOptions: AuthJwtSignOptions = { sub: user.email }
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

      const result = await authService.verifyOtp(options)

      expect(result).toEqual(authJwts)
      expect(otpsService.verify).toHaveBeenCalledWith(options)
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
      const body = getFakeOtp({ type: OtpType.SIGN_UP, email: user.email })

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
        sub: '',
        iat: 1,
        exp: 2,
      }
      const accessPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: '',
        iat: 1,
        exp: 2,
      }
      const refreshPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: '',
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
        sub: '',
        iat: 1,
        exp: 2,
      }
      const refreshPayload: JwtPayload = {
        jti: getFakeUuid(),
        sub: '',
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
