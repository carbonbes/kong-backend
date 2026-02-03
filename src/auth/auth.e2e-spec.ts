import { describe, beforeAll, afterAll, beforeEach, test, expect } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
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
import { OtpType } from '@/otps/otps.enums'
import { UserGender } from '@/users/users.types'
import { getFakeEmail, getFakeUser } from '@/test/utils'
import { SignUpDto } from '@/auth/auth.dtos'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let postgres: StartedPostgreSqlContainer
  let redis: StartedRedisContainer
  let mailService: MockProxy<MailService>
  let server: ReturnType<typeof app.getHttpServer>

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer('postgres:18-alpine').start()
    redis = await new RedisContainer('redis/redis-stack:latest').start()
    mailService = mock<MailService>()

    const postgresUrl = postgres.getConnectionUri()
    const redisUrl = redis.getConnectionUrl()

    process.env.DATABASE_URL = postgresUrl
    process.env.REDIS_URL = redisUrl

    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    })

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    app = module.createNestApplication()
    await app.init()
    server = app.getHttpServer()
  }, 1000000)

  afterAll(async () => {
    await app.close()
    await postgres.stop()
    await redis.stop()
  })

  describe('POST /auth/signup', () => {
    let body: SignUpDto

    beforeEach(() => {
      const { email, name, gender } = getFakeUser()
      body = { email, name, gender }
    })

    test('should be return 201 and create user with otp when email does not exist', async () => {
      const response = await request(server)
        .post('/auth/signup')
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty('otpId')
      expect(response.body).toHaveProperty('userId')
      expect(typeof response.body.otpId).toBe('string')
      expect(typeof response.body.userId).toBe('number')
      expect(mailService.sendOtp).toHaveBeenCalledTimes(1)
    })

    test('should be return 200 and null when user with email already exists', async () => {
      await request(server).post('/auth/signup').send(body).expect(201)

      const response = await request(server)
        .post('/auth/signup')
        .send(body)
        .expect(200)

      expect(response.body).toBeNull()
    })

    test('should be return 400 when email is invalid', async () => {
      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should be return 400 when name is missing', async () => {
      const signUpData = {
        email: getFakeEmail(),
        gender: UserGender.MALE,
      }

      await request(server).post('/auth/signup').send(signUpData).expect(400)
    })

    test('should be return 400 when gender is invalid', async () => {
      const signUpData = {
        email: getFakeEmail(),
        name: 'Test User',
        gender: 'INVALID_GENDER',
      }

      await request(server).post('/auth/signup').send(signUpData).expect(400)
    })
  })

  describe('POST /auth/signin', () => {
    test('should be return 201 and create otp when user exists and is active', async () => {
      const email = 'signin-test@example.com'
      const signUpData = {
        email,
        name: 'Signin Test User',
        gender: UserGender.MALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect(201)

      const otpCall = mailService.sendOtp.mock.calls[0][0]

      await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect(201)

      mailService.sendOtp.mockClear()

      const signInResponse = await request(server)
        .post('/auth/signin')
        .send({ email })
        .expect(201)

      expect(signInResponse.body).toHaveProperty('otpId')
      expect(signInResponse.body).toHaveProperty('userId')
      expect(signInResponse.body.userId).toBe(signUpResponse.body.userId)
      expect(mailService.sendOtp).toHaveBeenCalledTimes(1)
    })

    test('should be return 200 and null when user does not exist', async () => {
      const response = await request(server)
        .post('/auth/signin')
        .send({ email: getFakeEmail() })
        .expect(200)

      expect(response.body).toBeNull()
    })

    test('should be return 403 when user exists but is not active', async () => {
      const email = 'inactive@example.com'
      const signUpData = {
        email,
        name: 'Inactive User',
        gender: UserGender.FEMALE,
      }

      await request(server).post('/auth/signup').send(signUpData).expect(201)

      await request(server).post('/auth/signin').send({ email }).expect(403)
    })

    test('should be return 400 when email is invalid', async () => {
      await request(server)
        .post('/auth/signin')
        .send({ email: 'invalid-email' })
        .expect(400)
    })

    test('should be return 400 when email is missing', async () => {
      await request(server).post('/auth/signin').send({}).expect(400)
    })
  })

  describe('POST /auth/verify-otp', () => {
    test('should be return 201 and JWT pair for valid signup otp', async () => {
      const signUpData = {
        email: getFakeEmail(),
        name: 'Verify Signup User',
        gender: UserGender.MALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect(201)

      const otpCall = mailService.sendOtp.mock.calls[0][0]

      const verifyResponse = await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect(201)

      expect(verifyResponse.body).toHaveProperty('access_token')
      expect(verifyResponse.body).toHaveProperty('refresh_token')
      expect(typeof verifyResponse.body.access_token).toBe('string')
      expect(typeof verifyResponse.body.refresh_token).toBe('string')
    })

    test('should be return 201 and JWT pair for valid signin otp', async () => {
      const email = 'verify-signin@example.com'
      const signUpData = {
        email,
        name: 'Verify Signin User',
        gender: UserGender.FEMALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect(201)

      let otpCall = mailService.sendOtp.mock.calls[0][0]

      await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect(201)

      mailService.sendOtp.mockClear()

      const signInResponse = await request(server)
        .post('/auth/signin')
        .send({ email })
        .expect(201)

      otpCall = mailService.sendOtp.mock.calls[0][0]

      const verifyResponse = await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signInResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_IN,
          userId: signInResponse.body.userId,
        })
        .expect(201)

      expect(verifyResponse.body).toHaveProperty('access_token')
      expect(verifyResponse.body).toHaveProperty('refresh_token')
    })

    test('should be return 404 when otp is invalid', async () => {
      const signUpData = {
        email: getFakeEmail(),
        name: 'Verify Invalid User',
        gender: UserGender.MALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect(201)

      await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: '000000',
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect(404)
    })

    test('should be return 400 when otp data is invalid', async () => {
      await request(server)
        .post('/auth/verify-otp')
        .send({
          id: 'invalid-uuid',
          code: '123',
          type: 'INVALID_TYPE',
          userId: 'not-a-number',
        })
        .expect(400)
    })
  })

  describe('GET /auth/me', () => {
    test('should be return 200 and user data when authenticated', async () => {
      const signUpData = {
        email: getFakeEmail(),
        name: 'Me Test User',
        gender: UserGender.MALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect(201)

      const otpCall = mailService.sendOtp.mock.calls[0][0]

      const verifyResponse = await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect(201)

      const { access_token } = verifyResponse.body

      const meResponse = await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)

      expect(meResponse.body).toHaveProperty('id')
      expect(meResponse.body).toHaveProperty('email', signUpData.email)
      expect(meResponse.body).toHaveProperty('name', signUpData.name)
      expect(meResponse.body).toHaveProperty('gender', signUpData.gender)
      expect(meResponse.body).toHaveProperty('isActive', true)
    })

    test('should be return 401 when no authorization header', async () => {
      await request(server).get('/auth/me').expect(401)
    })

    test('should be return 401 when invalid token provided', async () => {
      await request(server)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('POST /auth/update', () => {
    test('should be return 201 and new JWT pair with valid refresh token', async () => {
      const signUpData = {
        email: getFakeEmail(),
        name: 'Update Test User',
        gender: UserGender.FEMALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect((res) => {
          if (res.status !== 201) {
            console.log('Signup error response:', res.status, res.body)
          }
        })
        .expect(201)

      const otpCall = mailService.sendOtp.mock.calls[0][0]

      const verifyResponse = await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect((res) => {
          if (res.status !== 201) {
            console.log('Verify OTP error response:', res.status, res.body)
          }
        })
        .expect(201)

      const { access_token, refresh_token } = verifyResponse.body

      const updateResponse = await request(server)
        .post('/auth/update')
        .set('Authorization', `Bearer ${refresh_token}`)
        .send({ access_token })
        .expect(201)

      expect(updateResponse.body).toHaveProperty('access_token')
      expect(updateResponse.body).toHaveProperty('refresh_token')
      expect(updateResponse.body.access_token).not.toBe(access_token)
      expect(updateResponse.body.refresh_token).not.toBe(refresh_token)
    })

    test('should be return 401 when no refresh token provided', async () => {
      await request(server)
        .post('/auth/update')
        .send({ access_token: 'some-token' })
        .expect(401)
    })

    test('should be return 401 when invalid refresh token provided', async () => {
      await request(server)
        .post('/auth/update')
        .set('Authorization', 'Bearer invalid-token')
        .send({ access_token: 'some-token' })
        .expect(401)
    })
  })

  describe('POST /auth/logout', () => {
    test('should be return 201 and revoke tokens successfully', async () => {
      const signUpData = {
        email: getFakeEmail(),
        name: 'Logout Test User',
        gender: UserGender.MALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect(201)

      const otpCall = mailService.sendOtp.mock.calls[0][0]

      const verifyResponse = await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect(201)

      const { access_token, refresh_token } = verifyResponse.body

      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ refresh_token })
        .expect(201)

      await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(401)
    })

    test('should be return 401 when no access token provided', async () => {
      await request(server)
        .post('/auth/logout')
        .send({ refresh_token: 'some-token' })
        .expect(401)
    })

    test('should be return 400 when refresh token is missing in body', async () => {
      const signUpData = {
        email: getFakeEmail(),
        name: 'Logout Missing User',
        gender: UserGender.FEMALE,
      }

      const signUpResponse = await request(server)
        .post('/auth/signup')
        .send(signUpData)
        .expect(201)

      const otpCall = mailService.sendOtp.mock.calls[0][0]

      const verifyResponse = await request(server)
        .post('/auth/verify-otp')
        .send({
          id: signUpResponse.body.otpId,
          code: otpCall.code,
          type: OtpType.SIGN_UP,
          userId: signUpResponse.body.userId,
        })
        .expect(201)

      const { access_token } = verifyResponse.body

      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .send({})
        .expect(400)
    })
  })
})
