import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { execSync } from 'child_process'
import { AppModule } from '@/app.module'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { MailService } from '@/shared/mail/mail.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeEmail, getFakeOtp, getFakeUser } from '@/test/utils'
import {
  AccessTokenDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
} from '@/auth/auth.dtos'
import { PrismaClient } from '@/shared/prisma/prisma.types'
import { PRISMA_CLIENT } from '@/shared/prisma/prisma.consts'
import { OtpType } from '@/otps/otps.enums'
import { OtpsService } from '@/otps/otps.service'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { AuthJwtsService } from '@/auth-jwts.service'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let postgres: StartedPostgreSqlContainer
  let redis: StartedRedisContainer
  let mailService: MockProxy<MailService>
  let prismaClient: PrismaClient
  let otpsService: OtpsService
  let authJwtsService: AuthJwtsService

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer('postgres:18-alpine').start()
    redis = await new RedisContainer('redis/redis-stack:latest').start()

    const postgresUrl = postgres.getConnectionUri()
    const redisUrl = redis.getConnectionUrl()

    process.env.DATABASE_URL = postgresUrl
    process.env.REDIS_URL = redisUrl

    execSync('npx prisma migrate deploy')

    mailService = mock<MailService>()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    await app.init()

    prismaClient = app.get(PRISMA_CLIENT)
    otpsService = app.get(OtpsService)
    jwtService = app.get(JwtService)
  }, 600000)

  afterAll(async () => {
    await app.close()
    await postgres.stop()
    await redis.stop()
  })

  beforeEach(async () => {
    mailService.sendOtp.mockClear()
  })

  describe('POST /auth/signup', () => {
    test('should be return 201 when user with some email does not exist', async () => {
      const { email, name, gender } = getFakeUser()
      const body: SignUpDto = { email, name, gender }

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty('otpId')
      expect(response.body).toHaveProperty('userId')
    })

    test('should be return 403 when user with some email already exists', async () => {
      const { email, name, gender } = getFakeUser()
      const body: SignUpDto = { email, name, gender }

      await prismaClient.user.create({ data: { email, name, gender } })

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(body)
        .expect(403)

      await prismaClient.user.deleteMany()
    })

    test('should be return 400 when email is invalid', async () => {
      const { name, gender } = getFakeUser()
      const body: SignUpDto = { email: '', name, gender }

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(body)
        .expect(400)
    })

    test('should be return 400 when name is empty', async () => {
      const { email, gender } = getFakeUser()
      const body: SignUpDto = { email, name: '', gender }

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(body)
        .expect(400)
    })

    test('should be return 400 when gender is invalid', async () => {
      const { email, name } = getFakeUser()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const body: SignUpDto = { email, name, gender: '' }

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(body)
        .expect(400)
    })
  })

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      await prismaClient.user.deleteMany()
    })

    test('should be return 201 when user exists and is active', async () => {
      const { email, name, gender } = getFakeUser()
      const body: SignInDto = { email }

      await prismaClient.user.create({
        data: { email, name, gender, isActive: true },
      })

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty('otpId')
      expect(response.body).toHaveProperty('userId')
    })

    test('should be return 403 when user does not exist', async () => {
      const body: SignInDto = { email: getFakeEmail() }

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(body)
        .expect(403)
    })

    test('should be return 403 when user exists but is not active', async () => {
      const { email, name, gender } = getFakeUser()
      const body: SignInDto = { email }

      await prismaClient.user.create({ data: { email, name, gender } })

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(body)
        .expect(403)
    })

    test('should be return 400 when email is invalid', async () => {
      const body: SignInDto = { email: '' }

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(body)
        .expect(400)
    })
  })

  describe('POST /auth/verify-otp', () => {
    test('should be return 201 and auth-JWT if signup otp is verified', async () => {
      const { email, name, gender } = getFakeUser()
      const { id: userId } = await prismaClient.user.create({
        data: { email, name, gender },
      })

      const { type } = getFakeOtp({ type: OtpType.SIGN_UP })
      const { id, code } = await otpsService.create({ type, userId })

      const body: VerifyOtpDto = { id, code, type, userId }

      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty(ACCESS_TOKEN_NAME)
      expect(response.body).toHaveProperty(REFRESH_TOKEN_NAME)
    })

    test('should be return 201 and auth-JWT if signin otp is verified', async () => {
      const { email, name, gender } = getFakeUser()
      const { id: userId } = await prismaClient.user.create({
        data: { email, name, gender },
      })

      const { type } = getFakeOtp({ type: OtpType.SIGN_IN })
      const { id, code } = await otpsService.create({ type, userId })

      const body: VerifyOtpDto = { id, code, type, userId }

      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty(ACCESS_TOKEN_NAME)
      expect(response.body).toHaveProperty(REFRESH_TOKEN_NAME)
    })

    test('should be return 404 when otp is not verified', async () => {
      const body: VerifyOtpDto = getFakeOtp()

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send(body)
        .expect(404)
    })
  })

  describe('GET /auth/me', () => {
    test('should be return 200 and user', async () => {
      const user = getFakeUser({ isActive: true })

      await prismaClient.user.create({ data: user })
      const { access_token } = await jwtService.sign({ sub: user.id })

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)

      expect(response.body).toEqual({
        ...user,
        createdAt: user.createdAt.toISOString(),
      })
    })

    test('should be return 401 when no authorization header', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401)
    })

    test('should be return 401 when invalid token provided', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('POST /auth/update', () => {
    test('should be return 201 and new JWT pair with valid refresh token', async () => {
      const user = getFakeUser({ isActive: true })
      const { id: userId } = await prismaClient.user.create({ data: user })

      const { access_token, refresh_token } = await jwtService.sign({
        sub: userId,
      })

      const body: AccessTokenDto = { access_token }

      const response = await request(app.getHttpServer())
        .post('/auth/update')
        .set('Authorization', `Bearer ${refresh_token}`)
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty(ACCESS_TOKEN_NAME)
      expect(response.body).toHaveProperty(REFRESH_TOKEN_NAME)

      await prismaClient.user.deleteMany()
    })

    test('should be return 401 when no refresh token provided', async () => {
      const body = { access_token: 'some-token' }

      await request(app.getHttpServer())
        .post('/auth/update')
        .send(body)
        .expect(401)
    })

    test('should be return 401 when invalid refresh token provided', async () => {
      const body = { access_token: 'some-token' }

      await request(app.getHttpServer())
        .post('/auth/update')
        .set('Authorization', 'Bearer invalid-token')
        .send(body)
        .expect(401)
    })
  })

  describe('POST /auth/logout', () => {
    test('should be return 200 and revoke tokens successfully', async () => {
      const user = getFakeUser({ isActive: true })
      const { id: userId } = await prismaClient.user.create({ data: user })

      const { access_token, refresh_token } = await jwtService.sign({
        sub: userId,
      })

      const body: RefreshTokenDto = { refresh_token }

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .send(body)
        .expect(200)

      await prismaClient.user.deleteMany()
    })

    test('should be return 401 when no access token provided', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refresh_token: 'some-token' })
        .expect(401)
    })

    test('should be return 400 when refresh token is missing in body', async () => {
      const user = getFakeUser({ isActive: true })
      const { id: userId } = await prismaClient.user.create({ data: user })

      const { access_token } = await jwtService.sign({
        sub: userId,
      })

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .send({})
        .expect(400)
    })
  })
})
