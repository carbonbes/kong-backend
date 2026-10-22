import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { MailService } from '@/mail/mail.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { ResendOtpDto, SignInDto, SignUpDto, VerifyOtpDto } from '@/auth/dtos'
import { OtpType } from '@/otps/enums'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '@/shared/consts'
import { App } from 'supertest/types'
import { OtpsService } from '@/otps/otps.service'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { UserGender } from '@/users/enums'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { PrismaClient } from '@/prisma/types'
import { PRISMA_CLIENT } from '@/prisma/consts'
import { execSync } from 'node:child_process'
import { createUser, truncateUsers } from './utils'
import cookieParser from 'cookie-parser'
import { parseSetCookie } from 'cookie'
import fs from 'node:fs'

describe('AuthController (e2e)', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let prismaClient: PrismaClient
  let otpsService: OtpsService
  let authJwtsService: AuthJwtsService

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer(
      'postgres:18-alpine',
    ).start()
    redisContainer = await new RedisContainer(
      'redis/redis-stack-server:7.2.0-v20',
    ).start()

    process.env.DATABASE_URL = postgresContainer.getConnectionUri()
    process.env.REDIS_URL = redisContainer.getConnectionUrl()

    mailService = mock<MailService>()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    prismaClient = module.get<PrismaClient>(PRISMA_CLIENT)
    otpsService = module.get<OtpsService>(OtpsService)
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    const httpsOptions = {
      key: fs.readFileSync('certs/private-key.pem'),
      cert: fs.readFileSync('certs/public.pem'),
    }

    app = module.createNestApplication({ httpsOptions })
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    app.enableCors({
      credentials: true,
      origin: 'http://localhost:3000',
    })
    app.use(cookieParser())
    server = app.getHttpServer()
    await app.init()

    execSync('yarn prisma db push')
  }, 60000 * 5)

  afterAll(async () => {
    await app.close()
    await postgresContainer.stop()
    await redisContainer.stop()
  })

  describe('POST /auth/signup', () => {
    beforeEach(async () => await truncateUsers(prismaClient))

    test('should return 201 when user with some email does not exist', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      }

      await request(server).post('/auth/signup').send(body).expect(201)
    })

    test('should return 403 when user with some email already exists', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      }

      await request(server).post('/auth/signup').send(body).expect(403)
    })

    test('should return 400 when email is empty', async () => {
      const body: SignUpDto = {
        email: '',
        name: 'Test',
        gender: UserGender.male,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when email is not email', async () => {
      const body: SignUpDto = {
        email: 'not email',
        name: 'Test',
        gender: UserGender.male,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when the email is longer than 100 characters', async () => {
      const body: SignUpDto = {
        email:
          'PMXWwZOQDyTyKiHDViGLscBnRCWoalwESoXWShXytJZBXIhAeJGTdhSiSmZuORRuzUcGyzrxjvYttqIOLTZLWhMfAfna@test.com',
        name: 'Test',
        gender: UserGender.male,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when name is empty', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: '',
        gender: UserGender.male,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when the name is longer than 100 characters', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'MYpmYTLaqoDuasawqeIxGgaqgkwBLjqGogJYxDfyEDUTnTpUkerWnmXuehNzvYhkmjHDZIvwZYZNCIETEqDjzOnMSLYNDDJcvBdxh',
        gender: UserGender.male,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when gender is empty', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        // @ts-expect-error gender field
        gender: '',
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when gender is invalid', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        // @ts-expect-error gender field
        gender: 'invalid',
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })
  })

  describe('POST /auth/signin', () => {
    beforeEach(async () => await truncateUsers(prismaClient))

    test('should return 201 when user exists and is active', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
        isActive: true,
      })

      const body: SignInDto = { email: 'test@test.com' }

      await request(server).post('/auth/signin').send(body).expect(201)
    })

    test('should return 403 when user does not exist', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const body: SignInDto = { email: 'test2@test.com' }

      await request(server).post('/auth/signin').send(body).expect(403)
    })

    test('should return 403 when user exists but is not active', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const body: SignInDto = { email: 'test@test.com' }

      await request(server).post('/auth/signin').send(body).expect(403)
    })

    test('should return 400 when email is empty', async () => {
      const body: SignInDto = { email: '' }

      await request(server).post('/auth/signin').send(body).expect(400)
    })

    test('should return 400 when email is invalid', async () => {
      const body: SignInDto = { email: 'invalid' }

      await request(server).post('/auth/signin').send(body).expect(400)
    })
  })

  describe('POST /auth/resend-otp', () => {
    beforeEach(async () => await truncateUsers(prismaClient))

    test('should return 201 when user exists', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
        isActive: true,
      })

      const body: ResendOtpDto = {
        email: 'test@test.com',
        type: OtpType.SIGN_IN,
      }

      await request(server).post('/auth/resend-otp').send(body).expect(201)
    })

    test('should return 403 when user does not exists', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
        isActive: true,
      })

      const body: ResendOtpDto = {
        email: 'test2@test.com',
        type: OtpType.SIGN_IN,
      }

      await request(server).post('/auth/resend-otp').send(body).expect(403)
    })

    test('should return 400 when email is empty', async () => {
      const body: ResendOtpDto = { email: '', type: OtpType.SIGN_IN }

      await request(server).post('/auth/resend-otp').send(body).expect(400)
    })

    test('should return 400 when email is invalid', async () => {
      const body: ResendOtpDto = { email: 'invalid', type: OtpType.SIGN_IN }

      await request(server).post('/auth/resend-otp').send(body).expect(400)
    })

    test('should return 400 when otp type is empty', async () => {
      // @ts-expect-error type field
      const body: ResendOtpDto = { email: 'test@test.com', type: '' }

      await request(server).post('/auth/resend-otp').send(body).expect(400)
    })

    test('should return 400 when otp type is invalid', async () => {
      // @ts-expect-error type field
      const body: ResendOtpDto = { email: 'test@test.com', type: 'invalid' }

      await request(server).post('/auth/resend-otp').send(body).expect(400)
    })
  })

  describe('POST /auth/verify-otp', () => {
    beforeEach(async () => await truncateUsers(prismaClient))

    test('should be return access/refresh-cookie if signup-otp is verified', async () => {
      const user = await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const { code } = await otpsService.create({
        type: OtpType.SIGN_UP,
        email: 'test@test.com',
      })

      const body: VerifyOtpDto = {
        code,
        type: OtpType.SIGN_UP,
        email: 'test@test.com',
      }

      const response = await request(server).post('/auth/verify-otp').send(body)

      const accessTokenSetCookie = parseSetCookie(
        response.headers['set-cookie'][0],
      )

      const refreshTokenSetCookie = parseSetCookie(
        response.headers['set-cookie'][1],
      )

      expect(response.status).toBe(201)

      expect(accessTokenSetCookie).toEqual({
        name: ACCESS_TOKEN_COOKIE_NAME,
        value: expect.any(String),
        expires: expect.any(Date),
        httpOnly: true,
        maxAge: 300,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })

      expect(refreshTokenSetCookie).toEqual({
        name: REFRESH_TOKEN_COOKIE_NAME,
        value: expect.any(String),
        expires: expect.any(Date),
        httpOnly: true,
        maxAge: 2592000,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })

      expect(response.body).toEqual({
        user: {
          ...user,
          isActive: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      })
    })

    test('should be return access/refresh-cookie if signin-otp is verified', async () => {
      const user = await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
        isActive: true,
      })

      const { code } = await otpsService.create({
        type: OtpType.SIGN_IN,
        email: 'test@test.com',
      })

      const body: VerifyOtpDto = {
        code,
        type: OtpType.SIGN_IN,
        email: 'test@test.com',
      }

      const response = await request(server).post('/auth/verify-otp').send(body)

      const accessTokenSetCookie = parseSetCookie(
        response.headers['set-cookie'][0],
      )

      const refreshTokenSetCookie = parseSetCookie(
        response.headers['set-cookie'][1],
      )

      expect(response.status).toBe(201)

      expect(accessTokenSetCookie).toEqual({
        name: ACCESS_TOKEN_COOKIE_NAME,
        value: expect.any(String),
        expires: expect.any(Date),
        httpOnly: true,
        maxAge: 300,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })

      expect(refreshTokenSetCookie).toEqual({
        name: REFRESH_TOKEN_COOKIE_NAME,
        value: expect.any(String),
        expires: expect.any(Date),
        httpOnly: true,
        maxAge: 2592000,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })

      expect(response.body).toEqual({
        user: {
          ...user,
          isActive: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      })
    })

    test('should be return 404 when otp is not verified', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      await otpsService.create({
        type: OtpType.SIGN_UP,
        email: 'test@test.com',
      })

      const body: VerifyOtpDto = {
        code: 'random',
        type: OtpType.SIGN_UP,
        email: 'test@test.com',
      }

      await request(server).post('/auth/verify-otp').send(body).expect(404)
    })
  })

  describe('GET /auth/me', () => {
    beforeEach(async () => await truncateUsers(prismaClient))

    test('should be return user', async () => {
      const user = await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
        isActive: true,
      })

      const { accessToken } = authJwtsService.sign({ sub: 'test@test.com' })

      const response = await request(server)
        .get('/auth/me')
        .set('Cookie', `${ACCESS_TOKEN_COOKIE_NAME}=${accessToken}`)
        .expect(200)

      expect(response.body).toEqual(user)
    })

    test('should be return 401 when not provided access-token cookie', async () => {
      await request(server).get('/auth/me').expect(401)
    })

    test('should be return 401 when provided access-token cookie is invalid', async () => {
      await request(server)
        .get('/auth/me')
        .set('Cookie', `${ACCESS_TOKEN_COOKIE_NAME}=invalid`)
        .expect(401)
    })
  })

  describe('POST /auth/update', () => {
    beforeEach(async () => truncateUsers(prismaClient))

    test('should be return new access/refresh-cookie', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const { refreshToken } = authJwtsService.sign({ sub: 'test@test.com' })

      const response = await request(server)
        .post('/auth/update')
        .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`)

      const accessTokenSetCookie = parseSetCookie(
        response.headers['set-cookie'][0],
      )

      const refreshTokenSetCookie = parseSetCookie(
        response.headers['set-cookie'][1],
      )

      expect(response.status).toBe(201)

      expect(accessTokenSetCookie).toEqual({
        name: ACCESS_TOKEN_COOKIE_NAME,
        value: expect.any(String),
        expires: expect.any(Date),
        httpOnly: true,
        maxAge: 300,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })

      expect(refreshTokenSetCookie).toEqual({
        name: REFRESH_TOKEN_COOKIE_NAME,
        value: expect.any(String),
        expires: expect.any(Date),
        httpOnly: true,
        maxAge: 2592000,
        path: '/',
        sameSite: 'lax',
        secure: true,
      })
    })

    test('should be return 401 when not provided refresh-token cookie', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const { accessToken } = authJwtsService.sign({ sub: 'test@test.com' })

      await request(server)
        .post('/auth/update')
        .set('Cookie', `${ACCESS_TOKEN_COOKIE_NAME}=${accessToken}`)
        .expect(401)
    })

    test('should be return 401 when provided refresh-token cookie is invalid', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const { accessToken } = authJwtsService.sign({ sub: 'test@test.com' })

      await request(server)
        .post('/auth/update')
        .set(
          'Cookie',
          `${ACCESS_TOKEN_COOKIE_NAME}=${accessToken}; ${REFRESH_TOKEN_COOKIE_NAME}=invalid`,
        )
        .expect(401)
    })
  })

  describe('POST /auth/logout', () => {
    beforeEach(async () => await truncateUsers(prismaClient))

    test('should be clear access/refresh-cookie', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const { accessToken, refreshToken } = authJwtsService.sign({
        sub: 'test@test.com',
      })

      const response = await request(server)
        .post('/auth/logout')
        .set(
          'Cookie',
          `${ACCESS_TOKEN_COOKIE_NAME}=${accessToken}; ${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
        )

      const accessTokenClearCookie = parseSetCookie(
        response.headers['set-cookie'][0],
      )

      const refreshTokenClearCookie = parseSetCookie(
        response.headers['set-cookie'][1],
      )

      expect(response.status).toBe(201)

      expect(accessTokenClearCookie).toEqual({
        name: ACCESS_TOKEN_COOKIE_NAME,
        value: '',
        expires: expect.any(Date),
        path: '/',
      })

      expect(refreshTokenClearCookie).toEqual({
        name: REFRESH_TOKEN_COOKIE_NAME,
        value: '',
        expires: expect.any(Date),
        path: '/',
      })
    })

    test('should be return 401 when provided refresh-token cookie is invalid', async () => {
      await createUser(prismaClient, {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.male,
      })

      const { accessToken } = authJwtsService.sign({
        sub: 'test@test.com',
      })

      await request(server)
        .post('/auth/logout')
        .set(
          'Cookie',
          `${ACCESS_TOKEN_COOKIE_NAME}=${accessToken}; ${REFRESH_TOKEN_COOKIE_NAME}=invalid`,
        )
        .expect(401)
    })
  })
})
