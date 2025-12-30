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
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { getMockRes } from 'vitest-mock-express'
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

  const jwtCookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    expires: new Date(Date.now() + 999999999 * 1000),
  }

  describe('signup', () => {
    const body: SignUpOptions = {
      email: 'test@test.com',
      name: 'Test',
      gender: 'MALE',
    }

    test('should return the otp ID and user ID if the specified email does not exist', async () => {
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

    test('should return null if a user with that email address exists', async () => {
      const result = null

      const serviceSpy = vi.spyOn(service, 'signUp').mockResolvedValue(result)

      expect(await controller.signUp(body)).toBe(result)
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })
  })

  describe('signin', () => {
    const body: SignInOptions = { email: 'test@test.com' }

    const user = createFakeUser({ ...body })
    const otp = createFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

    test('should return the otp ID and user ID if the specified email exists and is active', async () => {
      const result = {
        otpId: otp.id,
        userId: otp.userId,
      }

      const serviceSpy = vi.spyOn(service, 'signIn').mockResolvedValue(result)

      expect(await controller.signIn(body)).toEqual(result)
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })

    test('should return null if a user with the specified email address exists', async () => {
      const serviceSpy = vi.spyOn(service, 'signIn').mockResolvedValue(null)

      expect(await controller.signIn(body)).toBeNull()
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })

    test('should return 403 if the user with the specified email exists but is not activated', async () => {
      const serviceSpy = vi
        .spyOn(service, 'signIn')
        .mockRejectedValue(ForbiddenException)

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

    test('should return a jwts if the otp is correct', async () => {
      const jwts = {
        access_token: createFakeJwt({ type: 'access_token' }),
        refresh_token: createFakeJwt({ type: 'refresh_token' }),
      }

      const serviceSpy = vi.spyOn(service, 'verifyOtp').mockResolvedValue(jwts)

      await expect(controller.verifyOtp(body, res)).resolves.toBeUndefined()
      expect(serviceSpy).toHaveBeenCalledWith(body)
      expect(res.cookie).toHaveBeenCalledTimes(2)
      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_NAME,
        jwts.access_token,
        jwtCookieOptions,
      )
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_NAME,
        jwts.refresh_token,
        jwtCookieOptions,
      )
    })

    test('should return 404 if the otp is incorrect', async () => {
      const serviceSpy = vi
        .spyOn(service, 'verifyOtp')
        .mockRejectedValue(NotFoundException)

      await expect(controller.verifyOtp(body, res)).rejects.toThrow(
        NotFoundException,
      )
      expect(serviceSpy).toHaveBeenCalledWith(body)
    })
  })

  describe('me', () => {})

  describe('update', () => {
    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      clearMockRes()
    })

    test('should return a new pair of jwts', async () => {
      const rotateOptions: RotateOptions = {
        access_token: createFakeJwt({ type: 'access_token' }),
        refresh_token: createFakeJwt({ type: 'refresh_token' }),
      }

      const jwts = {
        access_token: createFakeJwt({ type: 'access_token' }),
        refresh_token: createFakeJwt({ type: 'refresh_token' }),
      }

      const serviceSpy = vi.spyOn(service, 'rotate').mockResolvedValue(jwts)

      await expect(
        controller.update(rotateOptions, res),
      ).resolves.toBeUndefined()
      expect(serviceSpy).toHaveBeenCalledWith(body)
      expect(res.cookie).toHaveBeenCalledTimes(2)
      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_NAME,
        jwts[ACCESS_TOKEN_NAME],
        jwtCookieOptions,
      )
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_NAME,
        jwts[REFRESH_TOKEN_NAME],
        jwtCookieOptions,
      )
    })
  })

  describe('logout', () => {})
})
