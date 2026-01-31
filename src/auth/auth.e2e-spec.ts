import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { UsersService } from '@/users/users.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import { MailService } from '@/shared/mail/mail.service'
import { mock } from 'vitest-mock-extended'
import { UsersModule } from '@/users/users.module'
import { MailModule } from '@/shared/mail/mail.module'
import { OtpsModule } from '@/otps/otps.module'
import { JwtsModule } from '@/jwts/jwts.module'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from '@/auth/auth.service'
import { AccessJwtStrategy } from '@/shared/strategies/passport/access-jwt.strategy'
import { RefreshJwtStrategy } from '@/shared/strategies/passport/refresh-jwt.strategy'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  const usersService = mock<UsersService>()
  const mailService = mock<MailService>()
  const otpsService = mock<OtpsService>()
  const jwtsService = mock<JwtsService>()
  const authService = mock<AuthService>()

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        MailModule,
        OtpsModule,
        JwtsModule,
        PassportModule,
      ],
      providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .overrideProvider(MailService)
      .useValue(mailService)
      .overrideProvider(OtpsService)
      .useValue(otpsService)
      .overrideProvider(JwtsService)
      .useValue(jwtsService)
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile()

    app = module.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /auth/signup', () => {})

  describe('POST /auth/signin', () => {})

  describe('POST /auth/verify-otp', () => {})

  describe('GET /auth/me', () => {})

  describe('POST /auth/update', () => {})

  describe('POST /auth/logout', () => {})
})
