import { AuthService } from '@/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '@/users/users.service'
import { OtpsService } from '@/otps/otps.service'
import {
  getFakeAuthJwts,
  getFakeEmail,
  getFakeJwt,
  getFakeOtp,
  getFakeUser,
} from '@/test/utils'
import { OtpType } from '@/otps/enums'
import { SignInOptions, SignUpOptions, VerifyOtpOptions } from '@/auth/types'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { mock, MockProxy } from 'vitest-mock-extended'
import { User } from '@/users/types'
import { REFRESH_TOKEN_NAME } from '@/shared/consts'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import {
  ClsPluginTransactional,
  NoOpTransactionalAdapter,
} from '@nestjs-cls/transactional'
import { ClsModule } from 'nestjs-cls'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: MockProxy<UsersService>
  let otpsService: MockProxy<OtpsService>
  let authJwtsService: MockProxy<AuthJwtsService>

  beforeEach(async () => {
    usersService = mock<UsersService>()
    otpsService = mock<OtpsService>()
    authJwtsService = mock<AuthJwtsService>()

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClsModule.registerPlugins([
          new ClsPluginTransactional({
            adapter: new NoOpTransactionalAdapter({
              tx: {
                query: vi.fn(),
              },
            }),
          }),
        ]),
      ],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: OtpsService, useValue: otpsService },
        { provide: AuthJwtsService, useValue: authJwtsService },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersService = module.get<MockProxy<UsersService>>(UsersService)
    otpsService = module.get<MockProxy<OtpsService>>(OtpsService)
    authJwtsService = module.get<MockProxy<AuthJwtsService>>(AuthJwtsService)
  })

  describe('signUp', () => {
    let options: SignUpOptions

    beforeEach(() => {
      const { email, name, gender } = getFakeUser()
      options = { email, name, gender }
    })

    test('should return a void if a user does not exist', async () => {
      const user = getFakeUser({ ...options })
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, email: user.email })

      usersService.exists.mockResolvedValue(false)
      usersService.create.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)

      const result = await authService.signUp(options)

      expect(usersService.exists).toHaveBeenCalledWith({
        where: { email: user.email },
      })
      expect(usersService.create).toHaveBeenCalledWith({ data: options })
      expect(otpsService.create).toHaveBeenCalledWith({
        type: otp.type,
        email: user.email,
      })
      expect(result).toEqual(undefined)
    })

    test('should return 403 if a user is exist', async () => {
      const user = getFakeUser({ ...options })

      usersService.exists.mockResolvedValue(true)

      await expect(authService.signUp(options)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.exists).toHaveBeenCalledWith({
        where: { email: user.email },
      })
    })
  })

  describe('signIn', () => {
    let options: SignInOptions

    beforeEach(() => {
      options = { email: getFakeEmail() }
    })

    test('should return a void if a user is exist and is active', async () => {
      const user = getFakeUser({ ...options, isActive: true })
      const otp = getFakeOtp({ type: OtpType.SIGN_IN, email: user.email })

      usersService.findUnique.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)

      const result = await authService.signIn(options)

      expect(usersService.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      })
      expect(otpsService.create).toHaveBeenCalledWith({
        type: otp.type,
        email: user.email,
      })
      expect(result).toEqual(undefined)
    })

    test('should return a 403 if a user does not exist', async () => {
      const user = getFakeUser({ ...options })

      usersService.findUnique.mockResolvedValue(null)

      await expect(authService.signIn(options)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      })
    })

    test('should return a 403 if a user does not active', async () => {
      const user = getFakeUser({ ...options, isActive: false })

      usersService.findUnique.mockResolvedValue(user)

      await expect(authService.signIn(options)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      })
    })
  })

  describe('verifyOtp', () => {
    let email: User['email']

    beforeEach(() => {
      email = getFakeUser().email
    })

    test('should return auth-jwts if such an OTP exists and type is SIGN_UP', async () => {
      const options: VerifyOtpOptions = getFakeOtp({
        type: OtpType.SIGN_UP,
        email,
      })
      const authJwts = getFakeAuthJwts({
        accessJwtOptions: { payload: { sub: email } },
        refreshJwtOptions: { payload: { sub: email } },
      })

      otpsService.verify.mockResolvedValue(true)
      authJwtsService.sign.mockResolvedValue(authJwts)

      const result = await authService.verifyOtp(options)

      expect(otpsService.verify).toHaveBeenCalledWith(options)
      expect(usersService.update).toHaveBeenCalledWith({
        where: { email },
        data: { isActive: true },
      })
      expect(authJwtsService.sign).toHaveBeenCalledWith({ sub: email })
      expect(result).toEqual(authJwts)
    })

    test('should return auth-jwts if such an OTP exists and type is SIGN_IN', async () => {
      const options: VerifyOtpOptions = getFakeOtp({
        type: OtpType.SIGN_IN,
        email,
      })

      const authJwts = getFakeAuthJwts({
        accessJwtOptions: { payload: { sub: email } },
        refreshJwtOptions: { payload: { sub: email } },
      })

      otpsService.verify.mockResolvedValue(true)
      authJwtsService.sign.mockResolvedValue(authJwts)

      const result = await authService.verifyOtp(options)

      expect(otpsService.verify).toHaveBeenCalledWith(options)
      expect(authJwtsService.sign).toHaveBeenCalledWith({ sub: email })
      expect(result).toEqual(authJwts)
    })

    test('should return a 404 if a OTP not found', async () => {
      const options: VerifyOtpOptions = getFakeOtp({
        type: OtpType.SIGN_UP,
        email,
      })

      otpsService.verify.mockResolvedValue(false)

      await expect(authService.verifyOtp(options)).rejects.toThrow(
        new NotFoundException(),
      )
      expect(otpsService.verify).toHaveBeenCalledWith(options)
    })
  })

  describe('update', () => {
    test('should return new auth-jwts', async () => {
      const oldRefreshJwt = getFakeJwt({ type: REFRESH_TOKEN_NAME })
      const newAuthJwts = getFakeAuthJwts()

      authJwtsService.rotate.mockResolvedValue(newAuthJwts)

      const result = await authService.update(oldRefreshJwt)

      expect(authJwtsService.rotate).toHaveBeenCalledWith(oldRefreshJwt)
      expect(result).toEqual(newAuthJwts)
    })
  })

  describe('logout', () => {
    test('should revoke auth-jwts', async () => {
      const refreshToken = getFakeJwt()

      const result = await authService.logout(refreshToken)

      expect(authJwtsService.revoke).toHaveBeenCalledWith(refreshToken)
      expect(result).toBeUndefined()
    })
  })
})
