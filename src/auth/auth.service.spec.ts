import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import {
  RotateOptions,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from './types'
import { UsersService } from '@/users/users.service'
import { MailService } from '@/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import { User } from '@/users/types'
import { Otp } from '@/otps/types'
import { OtpType } from '@/otps/enums'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Jwts } from '@/shared/types/jwts'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

describe('AuthService', () => {
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
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: OtpsService, useValue: otpsService },
        { provide: JwtsService, useValue: jwtsService },
      ],
    }).compile()

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
    id: '654321',
    code: '123456',
    type: OtpType.SIGN_UP,
    userId: user.id,
  }

  const jwts: Jwts = {
    [ACCESS_TOKEN_NAME]: '1.2.3.4',
    [REFRESH_TOKEN_NAME]: '1.2.3.4',
  }

  describe('signUp', () => {
    const signUpOptions: SignUpOptions = {
      email: 'test@test.com',
      name: 'Test',
      gender: 'MALE',
    }

    test('should return the otp ID and user ID if the specified email does not exist', async () => {
      const createdUser: User = {
        ...user,
        ...signUpOptions,
      }

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

      expect(await service.signUp(signUpOptions)).toEqual({
        id: createdOtp.id,
        userId: createdUser.id,
      })
    })

    test('should return undefined if a user with that email address exists', async () => {
      vi.spyOn(usersService, 'isExist').mockImplementation(async () => true)

      expect(await service.signUp(signUpOptions)).toBeUndefined()
    })
  })

  describe('signIn', () => {
    const signInOptions: SignInOptions = { email: 'test@test.com' }
    const existingActivatedUser: User = user
    const existingDeacticatedUser: User = {
      ...user,
      isActive: false,
    }

    test('should return the otp ID and user ID if the specified email exists and is active', async () => {
      const createdOtp: Otp = {
        ...otp,
        userId: existingActivatedUser.id,
      }

      vi.spyOn(usersService, 'findOne').mockImplementation(
        async () => existingActivatedUser,
      )
      vi.spyOn(otpsService, 'create').mockImplementation(async () => createdOtp)
      vi.spyOn(mailService, 'sendOtp').mockImplementation(async () => true)

      expect(await service.signIn(signInOptions)).toEqual({
        id: createdOtp.id,
        userId: existingActivatedUser.id,
      })
    })

    test('should return undefined if a user with the specified email address exists', async () => {
      vi.spyOn(usersService, 'findOne').mockImplementation(async () => null)

      expect(await service.signIn(signInOptions)).toBeUndefined()
    })

    test('should return 403 if the user with the specified email exists but is not activated', async () => {
      vi.spyOn(usersService, 'findOne').mockImplementation(
        async () => existingDeacticatedUser,
      )

      await expect(service.signIn(signInOptions)).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('verifyOtp', () => {
    const verifyOtpOptions: VerifyOtpOptions = {
      id: '654321',
      code: '123456',
      type: OtpType.SIGN_UP,
      userId: 1,
    }

    const updatedUser: User = {
      ...user,
      isActive: true,
    }

    test('should return a jwts if the otp is correct', async () => {
      const activatedUser: User = user

      vi.spyOn(otpsService, 'verify').mockImplementation(async () => true)
      vi.spyOn(usersService, 'setActive').mockImplementation(
        async () => updatedUser,
      )
      vi.spyOn(jwtsService, 'sign').mockImplementation(async () => jwts)

      expect(
        await usersService.setActive({
          where: { id: verifyOtpOptions.userId },
          value: true,
        }),
      ).toEqual(activatedUser)

      expect(await service.verifyOtp(verifyOtpOptions)).toEqual(jwts)
    })

    test('should return 404 if the otp is incorrect', async () => {
      vi.spyOn(otpsService, 'verify').mockImplementation(async () => false)

      await expect(service.verifyOtp(verifyOtpOptions)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  test('rotate must return a new pair of jwts', async () => {
    const rotateOptions: RotateOptions = {
      [ACCESS_TOKEN_NAME]: '1.2.3.4',
      [REFRESH_TOKEN_NAME]: '1.2.3.4',
    }

    vi.spyOn(jwtsService, 'rotate').mockImplementation(async () => jwts)

    expect(await service.rotate(rotateOptions)).toEqual(jwts)
  })
})
