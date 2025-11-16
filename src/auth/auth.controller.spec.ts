import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { RotateOptions } from './auth.types'
import { UsersService } from '@/users/users.service'
import { MailService } from '@/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import { User } from '@/users/users.types'
import { Otp } from '@/otps/otps.types'
import { OtpType } from '@/otps/otps.enums'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Jwts } from '@/shared/types/jwts'
import { AuthController } from './auth.controller'
import { getMockReq, getMockRes } from 'vitest-mock-express'
import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService
  let usersService: Omit<UsersService, 'prismaService' | 'update'>
  let mailService: Omit<MailService, 'mailerService'>
  let otpsService: Omit<OtpsService, 'configService'>
  let jwtsService: Omit<JwtsService, 'signedJwtsService' | 'revokedJwtsService'>

  usersService = {
    create: vi.fn(),
    findOne: vi.fn(),
    isExist: vi.fn(),
    setActive: vi.fn(),
  }

  mailService = {
    sendOtp: vi.fn(),
  }

  otpsService = {
    create: vi.fn(),
    verify: vi.fn(),
  }

  jwtsService = {
    sign: vi.fn(),
    revoke: vi.fn(),
    isRevoked: vi.fn(),
    rotate: vi.fn(),
    decode: vi.fn(),
  }

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
    usersService = module.get<UsersService>(UsersService)
    mailService = module.get<MailService>(MailService)
    otpsService = module.get<OtpsService>(OtpsService)
    jwtsService = module.get<JwtsService>(JwtsService)
  })

  const user: User = {
    id: 1,
    email: 'test@test.com',
    name: 'Test',
    gender: 'MALE',
    isActive: true,
    createdAt: new Date(),
  }

  const otp: Otp = {
    id: '1-2-3-4-5',
    code: '123456',
    type: OtpType.SIGN_UP,
    userId: user.id,
  }

  const jwts: Jwts = {
    access_token: '1.2.3.4',
    refresh_token: '1.2.3.4',
  }

  describe('signup', () => {
    const body: SignUpDto = {
      email: 'test@test.com',
      name: 'Test',
      gender: 'MALE',
    }

    const createdUser: User = {
      ...user,
      ...body,
    }

    test('should return the otp ID and user ID if the specified email does not exist', async () => {
      const createdOtp: Otp = {
        ...otp,
        userId: createdUser.id,
      }

      vi.spyOn(usersService, 'isExist').mockImplementation(async () => false)
      vi.spyOn(usersService, 'create').mockImplementation(
        async () => createdUser,
      )
      vi.spyOn(otpsService, 'create').mockImplementation(async () => createdOtp)
      vi.spyOn(mailService, 'sendOtp').mockImplementation(async () => true)

      expect(await service.signUp(body)).toEqual({
        otpId: createdOtp.id,
      })
    })

    test('should return null if a user with that email address exists', async () => {
      vi.spyOn(usersService, 'isExist').mockImplementation(async () => true)

      expect(await controller.signUp(body)).toBeNull()
    })
  })

  describe('signin', () => {
    const body: SignInDto = { email: 'test@test.com' }
    const existingActivatedUser: User = user
    const existingDeacticatedUser: User = {
      ...user,
      isActive: false,
    }

    const createdOtp: Otp = {
      ...otp,
      userId: existingActivatedUser.id,
    }

    test('should return the otp ID and user ID if the specified email exists and is active', async () => {
      vi.spyOn(usersService, 'findOne').mockImplementation(
        async () => existingActivatedUser,
      )
      vi.spyOn(otpsService, 'create').mockImplementation(async () => createdOtp)
      vi.spyOn(mailService, 'sendOtp').mockImplementation(async () => true)

      expect(await controller.signIn(body)).toEqual({
        otpId: createdOtp.id,
      })
    })

    test('should return null if a user with the specified email address exists', async () => {
      vi.spyOn(usersService, 'findOne').mockImplementation(async () => null)

      expect(await controller.signIn(body)).toBeNull()
    })

    test('should return 403 if the user with the specified email exists but is not activated', async () => {
      vi.spyOn(usersService, 'findOne').mockImplementation(
        async () => existingDeacticatedUser,
      )

      await expect(controller.signIn(body)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('verify-otp', () => {
    const body: VerifyOtpDto = {
      id: '1-2-3-4-5',
      code: '123456',
      type: OtpType.SIGN_UP,
      userId: 1,
    }

    const req = getMockReq({ body })
    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      clearMockRes()
    })

    test('should return a jwts if the otp is correct', async () => {
      vi.spyOn(otpsService, 'verify').mockImplementation(async () => true)
      vi.spyOn(jwtsService, 'sign').mockImplementation(async () => jwts)

      expect(req.body).toEqual(body)
      expect(await controller.verifyOtp(body, res)).resolves.toBeTruthy()
    })

    test('should return 404 if the otp is incorrect', async () => {
      vi.spyOn(otpsService, 'verify').mockImplementation(async () => false)

      await expect(controller.verifyOtp(body, res)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('me', () => {})

  describe('update', () => {
    test('should return a new pair of jwts', async () => {
      const rotateOptions: RotateOptions = {
        access_token: '1.2.3.4',
        refresh_token: '1.2.3.4',
      }

      vi.spyOn(jwtsService, 'rotate').mockImplementation(async () => jwts)

      expect(await controller.update(rotateOptions, res)).toEqual(jwts)
    })
  })

  describe('logout', () => {})
})
