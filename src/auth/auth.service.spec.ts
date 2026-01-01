import { beforeEach, describe, expect, test, vi } from 'vitest'
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
import { createFakeJwt, createFakeOtp, createFakeUser } from '@/test/utils'
import { OtpType } from '@/otps/otps.enums'
import {
  LoginReturn,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from '@/auth/auth.types'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { Jwts } from '@/shared/types'
import { getMockRes } from 'vitest-mock-express'
import { CookieOptions } from 'express'

describe('AuthService', () => {
  let service: AuthService
  const usersService = mockedUsersService
  const mailService = mockedMailService
  const otpsService = mockedOtpsService
  const jwtsService = mockedJwtsService
  const jwtCookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
  }
  const accessJwtExpiresIn = Number(process.env.ACCESS_JWT_EXPIRES_IN)
  const refreshJwtExpiresIn = Number(process.env.REFRESH_JWT_EXPIRES_IN)
  let currentTime: number

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
  })

  describe('signUp', () => {
    const { email, name, gender } = createFakeUser()
    const data: SignUpOptions = { email, name, gender }

    test('should return a user ID and otp ID if a user with that email not exist', async () => {
      const user = createFakeUser()
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      vi.spyOn(usersService, 'isExist').mockResolvedValue(false)
      vi.spyOn(usersService, 'create').mockResolvedValue(user)
      vi.spyOn(otpsService, 'create').mockResolvedValue(otp)
      vi.spyOn(mailService, 'sendOtp').mockResolvedValue(true)

      const serviceSpy = vi.spyOn(service, 'signUp')

      const result: LoginReturn = { otpId: otp.id, userId: user.id }

      expect(await service.signUp(data)).toEqual(result)
      expect(serviceSpy).toHaveBeenCalledWith(data)
    })

    test('should return null if a user with that email exists', async () => {
      vi.spyOn(usersService, 'isExist').mockResolvedValue(true)

      const result = null

      expect(await service.signUp(data)).toBe(result)
    })
  })

  describe('signIn', () => {
    const { email } = createFakeUser()
    const data: SignInOptions = { email }

    test('should return a user ID and otp ID if a user with that email has exist and user is active', async () => {
      const user = createFakeUser({ isActive: true })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user)
      vi.spyOn(otpsService, 'create').mockResolvedValue(otp)
      vi.spyOn(mailService, 'sendOtp').mockResolvedValue(true)

      const serviceSpy = vi.spyOn(service, 'signIn')

      const result: LoginReturn = { otpId: otp.id, userId: user.id }

      expect(await service.signIn(data)).toEqual(result)
      expect(serviceSpy).toHaveBeenCalledWith(data)
    })

    test('should return a null if a user with that email does not exist', async () => {
      const result: LoginReturn = null

      vi.spyOn(usersService, 'findOne').mockResolvedValue(result)

      const serviceSpy = vi.spyOn(service, 'signIn')

      expect(await service.signIn(data)).toBe(result)
      expect(serviceSpy).toHaveBeenCalledWith(data)
    })

    test('should return a 403 if a user with that email does not active', async () => {
      const user = createFakeUser({ isActive: false })

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user)

      const serviceSpy = vi.spyOn(service, 'signIn')

      await expect(service.signIn(data)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(serviceSpy).toHaveBeenCalledWith(data)
    })
  })

  describe('verifyOtp', () => {
    const body: VerifyOtpOptions['body'] = createFakeOtp()

    const { res, clearMockRes } = getMockRes()
    beforeEach(clearMockRes)

    test('should set a pair of cookies with JWT if such an OTP exists', async () => {
      const date = new Date()

      vi.useFakeTimers()
      vi.setSystemTime(date)

      currentTime = Date.now() / 1000

      const accessJwtCookieOptions: CookieOptions = {
        ...jwtCookieOptions,
        expires: new Date((currentTime + accessJwtExpiresIn) * 1000),
      }

      const refreshJwtCookieOptions: CookieOptions = {
        ...jwtCookieOptions,
        expires: new Date((currentTime + refreshJwtExpiresIn) * 1000),
      }

      const accessJwt = createFakeJwt({ type: ACCESS_TOKEN_NAME })
      const refreshJwt = createFakeJwt({ type: REFRESH_TOKEN_NAME })

      const user = createFakeUser()
      const jwts: Jwts = {
        [ACCESS_TOKEN_NAME]: accessJwt,
        [REFRESH_TOKEN_NAME]: refreshJwt,
      }

      vi.spyOn(otpsService, 'verify').mockResolvedValue(true)
      vi.spyOn(usersService, 'setActive').mockResolvedValue(user)
      vi.spyOn(jwtsService, 'sign').mockResolvedValue(jwts)

      const serviceSpy = vi.spyOn(service, 'verifyOtp')

      expect(await service.verifyOtp({ body, res })).toBe(undefined)
      expect(serviceSpy).toHaveBeenCalledWith({ body, res })
      expect(res.cookie).toHaveBeenCalledTimes(2)
      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        ACCESS_TOKEN_NAME,
        accessJwt,
        accessJwtCookieOptions,
      )
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        REFRESH_TOKEN_NAME,
        refreshJwt,
        refreshJwtCookieOptions,
      )

      vi.useRealTimers()
    })

    test('should return a 404 if a OTP not found', async () => {
      vi.spyOn(otpsService, 'verify').mockResolvedValue(false)

      const serviceSpy = vi.spyOn(service, 'verifyOtp')

      await expect(service.verifyOtp({ body, res })).rejects.toThrow(
        new NotFoundException(),
      )
      expect(serviceSpy).toHaveBeenCalledWith({ body, res })
    })
  })

  describe('rotate', () => {

  })
})
