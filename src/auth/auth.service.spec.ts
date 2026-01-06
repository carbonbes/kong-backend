import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { AuthService } from '@/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
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
import { mock, MockProxy } from 'vitest-mock-extended'
import {
  CreateOptions as UsersServiceCreateOptions,
  FindOneOptions as UsersServiceFindOneOptions,
  IsExistOptions as UsersServiceIsExistOptions,
  User,
} from '@/users/users.types'
import { CreateOptions as OtpsServiceCreateOptions } from '@/otps/otps.types'
import { SendOtpOptions as MailServiceSendOtpOptions } from '@/mail/mail.types'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: MockProxy<UsersService>
  let mailService: MockProxy<MailService>
  let otpsService: MockProxy<OtpsService>
  let jwtsService: MockProxy<JwtsService>
  const accessJwtExpiresIn = Number(process.env.ACCESS_JWT_EXPIRES_IN)
  const refreshJwtExpiresIn = Number(process.env.REFRESH_JWT_EXPIRES_IN)
  let currentTime: number
  let accessJwtCookieOptions: CookieOptions
  let refreshJwtCookieOptions: CookieOptions

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(mock)
      .compile()

    authService = module.get(AuthService)
    usersService = module.get(UsersService)
    mailService = module.get(MailService)
    otpsService = module.get(OtpsService)
    jwtsService = module.get(JwtsService)

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

    beforeEach(() => {
      const { email, name, gender } = createFakeUser()
      data = { email, name, gender }
    })

    test('should be return a user ID and otp ID if a user with that email not exist', async () => {
      const user = createFakeUser({ ...data })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      usersService.isExist.mockResolvedValue(false)
      usersService.create.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)
      mailService.sendOtp.mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }
      const usersServiceIsExistOptions: UsersServiceIsExistOptions = {
        where: { email: user.email },
      }
      const usersServiceCreateOptions: UsersServiceCreateOptions = data
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: OtpType.SIGN_UP,
        userId: user.id,
      }
      const mailServiceSendOtpOptions: MailServiceSendOtpOptions = {
        email: user.email,
        code: otp.code,
        type: OtpType.SIGN_UP,
      }

      expect(await authService.signUp(data)).toEqual(result)
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

    test('should be return null if a user with that email exists', async () => {
      const user = createFakeUser({ ...data })

      usersService.isExist.mockResolvedValue(true)

      const result: LoginReturn = null
      const userIsExistOptions: UsersServiceIsExistOptions = {
        where: { email: user.email },
      }

      expect(await authService.signUp(data)).toBe(result)
      expect(usersService.isExist).toHaveBeenCalledWith(userIsExistOptions)
    })
  })

  describe('signIn', () => {
    let data: SignInOptions

    beforeEach(() => {
      const { email } = createFakeUser()
      data = { email }
    })

    test('should be return a user ID and otp ID if a user with that email has exist and user is active', async () => {
      const user = createFakeUser({ ...data, isActive: true })
      const otp = createFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      usersService.findOne.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)
      mailService.sendOtp.mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: OtpType.SIGN_IN,
        userId: user.id,
      }
      const mailServiceSendOtpOptions: MailServiceSendOtpOptions = {
        email: user.email,
        code: otp.code,
        type: OtpType.SIGN_IN,
      }

      expect(await authService.signIn(data)).toEqual(result)
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
      expect(otpsService.create).toHaveBeenCalledWith(otpsServiceCreateOptions)
      expect(mailService.sendOtp).toHaveBeenCalledWith(
        mailServiceSendOtpOptions,
      )
    })

    test('should be return a null if a user with that email does not exist', async () => {
      const user = createFakeUser({ ...data })
      const result: LoginReturn = null
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }

      usersService.findOne.mockResolvedValue(result)

      expect(await authService.signIn(data)).toBe(result)
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
    })

    test('should be return a 403 if a user with that email does not active', async () => {
      const user = createFakeUser({ ...data, isActive: false })

      usersService.findOne.mockResolvedValue(user)

      await expect(authService.signIn(data)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      })
    })
  })

  describe('verifyOtp', () => {
    let user: User
    let body: VerifyOtpOptions['body']
    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      user = createFakeUser()
      body = createFakeOtp({ userId: user.id })
      clearMockRes()
    })

    test('should be set a pair of cookies with JWT if such an OTP exists', async () => {
      const otp = createFakeOtp({
        ...body,
        type: OtpType.SIGN_UP,
      })
      const jwts = createFakeJwts()

      otpsService.verify.mockResolvedValue(true)
      usersService.setActive.mockResolvedValue(user)
      jwtsService.sign.mockResolvedValue(jwts)

      expect(await authService.verifyOtp({ body, res })).toBe(undefined)
      expect(otpsService.verify).toHaveBeenCalledWith(otp)
      expect(usersService.setActive).toHaveBeenCalledWith({
        where: { email: user.email },
        data: { isActive: true },
      })
      expect(jwtsService.sign).toHaveBeenCalledWith({ sub: user.id })
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
      otpsService.verify.mockResolvedValue(false)

      await expect(authService.verifyOtp({ body, res })).rejects.toThrow(
        new NotFoundException(),
      )
      expect(mockAuthServiceVerifyOtp).toHaveBeenCalledWith({ body, res })
    })
  })

  describe('rotate', () => {
    test('should be set a pair of cookies with JWT', async () => {
      const { res } = getMockRes()
      const oldJwts = createFakeJwts()
      const newJwts = createFakeJwts()

      jwtsService.rotate.mockResolvedValue(newJwts)

      const mockAuthServiceRotate = vi.spyOn(authService, 'rotate')

      expect(await authService.rotate({ jwts: oldJwts, res })).toBeUndefined()
      expect(mockAuthServiceRotate).toHaveBeenCalledWith({ jwts: oldJwts, res })
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

      const mockAuthServiceLogout = vi.spyOn(authService, 'logout')

      expect(await authService.logout({ jwts, res })).toBeUndefined()
      expect(mockAuthServiceLogout).toHaveBeenCalledWith({ jwts, res })
      expect(res.clearCookie).toHaveBeenCalledTimes(2)
      expect(res.clearCookie).toHaveBeenNthCalledWith(1, ACCESS_TOKEN_NAME)
      expect(res.clearCookie).toHaveBeenNthCalledWith(2, REFRESH_TOKEN_NAME)
    })
  })
})
