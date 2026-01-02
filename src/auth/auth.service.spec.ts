import {
  afterEach,
  beforeEach,
  describe,
  expect,
  MockInstance,
  test,
  vi,
} from 'vitest'
import { AuthService } from '@/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import {
  mockedJwtsService,
  mockedMailService,
  mockedOtpsService,
  mockedUsersService,
} from '@/test/mocks'
import { UsersService } from '@/users/users.service'
import { MailService } from '@/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import { createFakeJwts, createFakeOtp, createFakeUser } from '@/test/utils'
import { OtpType } from '@/otps/otps.enums'
import {
  LoginReturn,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from '@/auth/auth.types'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import {
  ACCESS_TOKEN_NAME,
  JWT_COOKIE_OPTIONS,
  REFRESH_TOKEN_NAME,
} from '@/shared/consts'
import { getMockRes } from 'vitest-mock-express'
import { CookieOptions } from 'express'

describe('AuthService', () => {
  let service: AuthService
  const usersService = mockedUsersService
  const mailService = mockedMailService
  const otpsService = mockedOtpsService
  const jwtsService = mockedJwtsService
  const accessJwtExpiresIn = Number(process.env.ACCESS_JWT_EXPIRES_IN)
  const refreshJwtExpiresIn = Number(process.env.REFRESH_JWT_EXPIRES_IN)
  let currentTime: number
  let accessJwtCookieOptions: CookieOptions
  let refreshJwtCookieOptions: CookieOptions

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: OtpsService, useValue: otpsService },
        { provide: JwtsService, useValue: jwtsService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)

    vi.useFakeTimers()
    vi.setSystemTime(new Date())
    currentTime = Date.now() / 1000

    accessJwtCookieOptions = {
      ...JWT_COOKIE_OPTIONS,
      expires: new Date((currentTime + accessJwtExpiresIn) * 1000),
    }

    refreshJwtCookieOptions = {
      ...JWT_COOKIE_OPTIONS,
      expires: new Date((currentTime + refreshJwtExpiresIn) * 1000),
    }
  })

  afterEach(vi.useRealTimers)

  describe('signUp', () => {
    let data: SignUpOptions
    let spy: MockInstance<typeof service.signUp>

    beforeEach(() => {
      const { email, name, gender } = createFakeUser()
      data = { email, name, gender }
      spy = vi.spyOn(service, 'signUp')
    })

    afterEach(() => spy.mockRestore())

    test('should be return a user ID and otp ID if a user with that email not exist', async () => {
      const user = createFakeUser()
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      vi.spyOn(usersService, 'isExist').mockResolvedValue(false)
      vi.spyOn(usersService, 'create').mockResolvedValue(user)
      vi.spyOn(otpsService, 'create').mockResolvedValue(otp)
      vi.spyOn(mailService, 'sendOtp').mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }

      expect(await service.signUp(data)).toEqual(result)
      expect(spy).toHaveBeenCalledWith(data)
    })

    test('should be return null if a user with that email exists', async () => {
      vi.spyOn(usersService, 'isExist').mockResolvedValue(true)

      const result: LoginReturn = null

      expect(await service.signUp(data)).toBe(result)
      expect(spy).toHaveBeenCalledWith(data)
    })
  })

  describe('signIn', () => {
    let data: SignInOptions
    let spy: MockInstance<typeof service.signIn>

    beforeEach(() => {
      const { email } = createFakeUser()
      data = { email }
      spy = vi.spyOn(service, 'signIn')
    })

    test('should be return a user ID and otp ID if a user with that email has exist and user is active', async () => {
      const user = createFakeUser({ isActive: true })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user)
      vi.spyOn(otpsService, 'create').mockResolvedValue(otp)
      vi.spyOn(mailService, 'sendOtp').mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }

      expect(await service.signIn(data)).toEqual(result)
      expect(spy).toHaveBeenCalledWith(data)
    })

    test('should be return a null if a user with that email does not exist', async () => {
      const result: LoginReturn = null

      vi.spyOn(usersService, 'findOne').mockResolvedValue(result)

      expect(await service.signIn(data)).toBe(result)
      expect(spy).toHaveBeenCalledWith(data)
    })

    test('should be return a 403 if a user with that email does not active', async () => {
      const user = createFakeUser({ isActive: false })

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user)

      await expect(service.signIn(data)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(spy).toHaveBeenCalledWith(data)
    })
  })

  describe('verifyOtp', () => {
    let body: VerifyOtpOptions['body']
    let spy: MockInstance<typeof service.verifyOtp>
    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      body = createFakeOtp()
      clearMockRes()
      spy = vi.spyOn(service, 'verifyOtp')
    })

    afterEach(() => spy.mockRestore())

    test('should be set a pair of cookies with JWT if such an OTP exists', async () => {
      const user = createFakeUser()
      const jwts = createFakeJwts()

      vi.spyOn(otpsService, 'verify').mockResolvedValue(true)
      vi.spyOn(usersService, 'setActive').mockResolvedValue(user)
      vi.spyOn(jwtsService, 'sign').mockResolvedValue(jwts)

      expect(await service.verifyOtp({ body, res })).toBe(undefined)
      expect(spy).toHaveBeenCalledWith({ body, res })
      expect(res.cookie).toHaveBeenCalledTimes(2)
      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        ACCESS_TOKEN_NAME,
        jwts[ACCESS_TOKEN_NAME],
        accessJwtCookieOptions,
      )
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        REFRESH_TOKEN_NAME,
        jwts[REFRESH_TOKEN_NAME],
        refreshJwtCookieOptions,
      )
    })

    test('should be return a 404 if a OTP not found', async () => {
      vi.spyOn(otpsService, 'verify').mockResolvedValue(false)

      await expect(service.verifyOtp({ body, res })).rejects.toThrow(
        new NotFoundException(),
      )
      expect(spy).toHaveBeenCalledWith({ body, res })
    })
  })

  describe('rotate', () => {
    test('should be set a pair of cookies with JWT', async () => {
      const { res } = getMockRes()
      const oldJwts = createFakeJwts()
      const newJwts = createFakeJwts()

      vi.spyOn(jwtsService, 'rotate').mockResolvedValue(newJwts)

      const spy = vi.spyOn(service, 'rotate')

      expect(await service.rotate({ jwts: oldJwts, res })).toBeUndefined()
      expect(spy).toHaveBeenCalledWith({ jwts: oldJwts, res })
      expect(res.cookie).toHaveBeenCalledTimes(2)
      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        ACCESS_TOKEN_NAME,
        newJwts[ACCESS_TOKEN_NAME],
        accessJwtCookieOptions,
      )
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        REFRESH_TOKEN_NAME,
        newJwts[REFRESH_TOKEN_NAME],
        refreshJwtCookieOptions,
      )
    })
  })

  describe('logout', () => {
    test('should be remove a pair of cookies with JWT', async () => {
      const { res } = getMockRes()
      const jwts = createFakeJwts()

      const spy = vi.spyOn(service, 'logout')

      expect(await service.logout({ jwts, res })).toBeUndefined()
      expect(spy).toHaveBeenCalledWith({ jwts, res })
      expect(res.clearCookie).toHaveBeenCalledTimes(2)
      expect(res.clearCookie).toHaveBeenNthCalledWith(1, ACCESS_TOKEN_NAME)
      expect(res.clearCookie).toHaveBeenNthCalledWith(2, REFRESH_TOKEN_NAME)
    })
  })
})
