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

  describe('signUp', () => {
    const { email, name, gender } = createFakeUser()
    const body: SignUpOptions = { email, name, gender }

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

  describe('signIn', () => {
    const { email } = createFakeUser()
    const body: SignInOptions = { email }

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
      const result = null

      const serviceSpy = vi.spyOn(service, 'signIn').mockResolvedValue(result)

      expect(await controller.signIn(body)).toBe(result)
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

  describe('verifyOtp', () => {
    const body: VerifyOtpOptions['body'] = createFakeOtp()
    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      clearMockRes()
    })

    test('should be called with the correct arguments', async () => {
      const date = new Date()

      vi.useFakeTimers()
      vi.setSystemTime(date)

      const serviceSpy = vi
        .spyOn(service, 'verifyOtp')
        .mockResolvedValue(undefined)

      await expect(controller.verifyOtp(body, res)).resolves.toBeUndefined()
      expect(serviceSpy).toHaveBeenCalledWith({ body, res })

      vi.useRealTimers()
    })

    test('should return 404', async () => {
      const serviceSpy = vi
        .spyOn(service, 'verifyOtp')
        .mockRejectedValue(new NotFoundException())

      await expect(controller.verifyOtp(body, res)).rejects.toThrow(
        NotFoundException,
      )
      expect(serviceSpy).toHaveBeenCalledWith({ body, res })
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
    test('should be called with the correct arguments', async () => {
      const { res, clearMockRes } = getMockRes()

      beforeEach(() => {
        clearMockRes()
      })

      const date = new Date()

      vi.useFakeTimers()
      vi.setSystemTime(date)

      const currentJwts: RotateOptions['jwts'] = {
        [ACCESS_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
        [REFRESH_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
      }

      const serviceSpy = vi
        .spyOn(service, 'rotate')
        .mockResolvedValue(undefined)

      await expect(controller.update(currentJwts, res)).resolves.toBeUndefined()
      expect(serviceSpy).toHaveBeenCalledWith({ jwts: currentJwts, res })

      vi.useRealTimers()
    })
  })

  describe('logout', () => {
    test('should be called with the correct arguments', async () => {
      const { res, clearMockRes } = getMockRes()

      beforeEach(() => {
        clearMockRes()
      })

      const date = new Date()

      vi.useFakeTimers()
      vi.setSystemTime(date)

      const currentJwts: RotateOptions['jwts'] = {
        [ACCESS_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
        [REFRESH_TOKEN_NAME]: createFakeJwt({ type: ACCESS_TOKEN_NAME }),
      }

      const serviceSpy = vi
        .spyOn(service, 'logout')
        .mockResolvedValue(undefined)

      await expect(controller.logout(currentJwts, res)).resolves.toBeUndefined()
      expect(serviceSpy).toHaveBeenCalledWith({ jwts: currentJwts, res })

      vi.useRealTimers()
    })
  })
})
