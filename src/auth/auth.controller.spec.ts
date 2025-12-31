import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import {
  RotateOptions,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from './auth.types'
import { OtpType } from '@/otps/otps.enums'
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthController } from './auth.controller'
import { getMockReq, getMockRes } from 'vitest-mock-express'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { CookieOptions } from 'express'
import { createFakeJwt, createFakeOtp, createFakeUser } from '@/test/utils'
import { UsersService } from '@/users/users.service'
import { MailService } from '@/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import {
  mockedJwtsService,
  mockedMailService,
  mockedOtpsService,
  mockedUsersService,
} from '@/test/mocks'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService

  const usersService = mockedUsersService
  const mailService = mockedMailService
  const otpsService = mockedOtpsService
  const jwtsService = mockedJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: OtpsService, useValue: otpsService },
        { provide: JwtsService, useValue: jwtsService },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    service = module.get<AuthService>(AuthService)
  })

  describe('signup', () => {
    const body: SignUpOptions = {
      email: 'test@test.com',
      name: 'Test',
      gender: 'MALE',
    }

    test('should return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      const result = {
        otpId: otp.id,
        userId: otp.userId,
      }

      const serviceSpy = vi.spyOn(service, 'signUp').mockResolvedValue(result)

      expect(await service.signUp(body)).toEqual(result)
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })

    test('should return null', async () => {
      const result = null

      const serviceSpy = vi.spyOn(service, 'signUp').mockResolvedValue(result)

      expect(await controller.signUp(body)).toBe(result)
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })
  })

  describe('signin', () => {
    const body: SignInOptions = { email: 'test@test.com' }

    test('should return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      const result = {
        otpId: otp.id,
        userId: otp.userId,
      }

      const serviceSpy = vi.spyOn(service, 'signIn').mockResolvedValue(result)

      expect(await controller.signIn(body)).toEqual(result)
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })

    test('should return null', async () => {
      const serviceSpy = vi.spyOn(service, 'signIn').mockResolvedValue(null)

      expect(await controller.signIn(body)).toBeNull()
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })

    test('should return 403', async () => {
      const serviceSpy = vi
        .spyOn(service, 'signIn')
        .mockRejectedValue(new ForbiddenException())

      await expect(controller.signIn(body)).rejects.toThrow(ForbiddenException)
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })
  })

  describe('verify-otp', () => {
    const body: VerifyOtpOptions = createFakeOtp()

    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      clearMockRes()
    })

    test('should return a jwts', async () => {
      const date = new Date()

      vi.useFakeTimers()
      vi.setSystemTime(date)

      const jwtCookieOptions: CookieOptions = {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      }

      const accessJwtExpiresIn = Number(process.env.ACCESS_JWT_EXPIRES_IN)
      const refreshJwtExpiresIn = Number(process.env.REFRESH_JWT_EXPIRES_IN)

      const currentTime = Date.now() / 1000

      const accessJwtCookieOptions: CookieOptions = {
        ...jwtCookieOptions,
        expires: new Date((currentTime + accessJwtExpiresIn) * 1000),
      }

      const refreshJwtCookieOptions: CookieOptions = {
        ...jwtCookieOptions,
        expires: new Date((currentTime + refreshJwtExpiresIn) * 1000),
      }

      const jwts = {
        [ACCESS_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
        [REFRESH_TOKEN_NAME]: createFakeJwt({ type: REFRESH_TOKEN_NAME }),
      }

      const serviceSpy = vi.spyOn(service, 'verifyOtp').mockResolvedValue(jwts)

      await expect(controller.verifyOtp(body, res)).resolves.toBeUndefined()
      expect(serviceSpy).toHaveBeenCalledWith(body)
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

      vi.useRealTimers()
    })

    test('should return 404', async () => {
      const serviceSpy = vi
        .spyOn(service, 'verifyOtp')
        .mockRejectedValue(new NotFoundException())

      await expect(controller.verifyOtp(body, res)).rejects.toThrow(
        NotFoundException,
      )
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })
  })

  describe('me', () => {
    test('should return a user', async () => {
      const user = createFakeUser()
      const req = getMockReq({ user })

      expect(await controller.me(req)).toEqual(user)
    })

    test('should return 401', async () => {
      const req = getMockReq()

      vi.spyOn(controller, 'me').mockRejectedValue(new UnauthorizedException())

      await expect(controller.me(req)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('update', () => {
    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      clearMockRes()
    })

    test('should return a new pair of jwts', async () => {
      const date = new Date()

      vi.useFakeTimers()
      vi.setSystemTime(date)

      const jwtCookieOptions: CookieOptions = {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      }

      const accessJwtExpiresIn = Number(process.env.ACCESS_JWT_EXPIRES_IN)
      const refreshJwtExpiresIn = Number(process.env.REFRESH_JWT_EXPIRES_IN)

      const currentTime = Date.now() / 1000

      const accessJwtCookieOptions: CookieOptions = {
        ...jwtCookieOptions,
        expires: new Date((currentTime + accessJwtExpiresIn) * 1000),
      }

      const refreshJwtCookieOptions: CookieOptions = {
        ...jwtCookieOptions,
        expires: new Date((currentTime + refreshJwtExpiresIn) * 1000),
      }

      const rotateOptions: RotateOptions = {
        [ACCESS_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
        [REFRESH_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
      }

      const jwts = {
        [ACCESS_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
        [REFRESH_TOKEN_NAME]: createFakeJwt({ type: REFRESH_TOKEN_NAME }),
      }

      const serviceSpy = vi.spyOn(service, 'rotate').mockResolvedValue(jwts)

      await expect(
        controller.update(rotateOptions, res),
      ).resolves.toBeUndefined()
      expect(serviceSpy).toHaveBeenCalledWith(rotateOptions)
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

      vi.useRealTimers()
    })
  })

  describe('logout', () => {})
})
