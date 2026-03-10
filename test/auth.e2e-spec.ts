import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { execSync } from 'child_process'
import { AppModule } from '@/app.module'
import { MailService } from '@/mail/mail.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { SignInDto, SignUpDto, VerifyOtpDto } from '@/auth/dtos'
import { OtpType } from '@/otps/enums'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { App } from 'supertest/types'
import { PrismaService } from '@/prisma/prisma.service'
import { OtpsService } from '@/otps/otps.service'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let prismaService: PrismaService
  let otpsService: OtpsService
  let authJwtsService: AuthJwtsService

  beforeAll(async () => {
    execSync('docker-compose up db-test redis-om-test mail -d')
    execSync('yarn prisma db push')
    execSync('yarn prisma generate')

    mailService = mock<MailService>()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    prismaService = module.get<PrismaService>(PrismaService)
    otpsService = module.get<OtpsService>(OtpsService)
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    execSync('docker-compose down db-test redis-om-test mail')
  })

  describe('POST /auth/signup', () => {
    afterEach(async () => {
      await prismaService.user.deleteMany()
    })

    test('should be return 201 when user with some email does not exist', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: 'MALE',
      }

      await request(server).post('/auth/signup').send(body).expect(201)
    })

    test('should be return 403 when user with some email already exists', async () => {
      await prismaService.user.create({
        data: { email: 'test@test.com', name: 'Test', gender: 'MALE' },
      })

      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: 'MALE',
      }

      await request(server).post('/auth/signup').send(body).expect(403)
    })

    test('should be return 400 when email is empty', async () => {
      const body: SignUpDto = { email: '', name: 'Test', gender: 'MALE' }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should be return 400 when email is invalid', async () => {
      const body: SignUpDto = {
        email: 'invalid',
        name: 'Test',
        gender: 'MALE',
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should be return 400 when name is empty', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: '',
        gender: 'MALE',
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should be return 400 when the name is longer than 150 characters', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'ndaickzekaxetgqpvbkhesjpiwvmukgmdedomelvrtphbigjuxzlkeqohvaylcghqxlvfbrzwmyjyxukaibiikpmritllnofjorptfkftzwxblkasiqgdyabtjuxkgvijphindqbxcuhwgoqyemlxwq',
        gender: 'MALE',
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should be return 400 when gender is empty', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: '',
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should be return 400 when gender is invalid', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: 'invalid',
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })
  })

  describe('POST /auth/signin', () => {
    afterEach(async () => {
      await prismaService.user.deleteMany()
    })

    test('should be return 201 when user exists and is active', async () => {
      await prismaService.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test',
          gender: 'MALE',
          isActive: true,
        },
      })

      const body: SignInDto = { email: 'test@test.com' }

      await request(server).post('/auth/signin').send(body).expect(201)
    })

    test('should be return 403 when user does not exist', async () => {
      await prismaService.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test',
          gender: 'MALE',
        },
      })

      const body: SignInDto = { email: 'random@random.com' }

      await request(server).post('/auth/signin').send(body).expect(403)
    })

    test('should be return 403 when user exists but is not active', async () => {
      await prismaService.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test',
          gender: 'MALE',
        },
      })

      const body: SignInDto = { email: 'test@test.com' }

      await request(server).post('/auth/signin').send(body).expect(403)
    })

    test('should be return 400 when email is empty', async () => {
      const body: SignInDto = { email: '' }

      await request(server).post('/auth/signin').send(body).expect(400)
    })

    test('should be return 400 when email is invalid', async () => {
      const body: SignInDto = { email: 'invalid' }

      await request(server).post('/auth/signin').send(body).expect(400)
    })
  })

  describe('POST /auth/verify-otp', () => {
    afterEach(async () => {
      await prismaService.user.deleteMany()
    })

    test('should be return 201 and auth-jwts if signup otp is verified', async () => {
      await prismaService.user.create({
        data: { email: 'test@test.com', name: 'Test', gender: 'MALE' },
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

      const response = await request(server)
        .post('/auth/verify-otp')
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty(ACCESS_TOKEN_NAME)
      expect(response.body).toHaveProperty(REFRESH_TOKEN_NAME)
    })

    test('should be return 201 and auth-jwts if signin otp is verified', async () => {
      await prismaService.user.create({
        data: { email: 'test@test.com', name: 'Test', gender: 'MALE' },
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

      const response = await request(server)
        .post('/auth/verify-otp')
        .send(body)
        .expect(201)

      expect(response.body).toHaveProperty(ACCESS_TOKEN_NAME)
      expect(response.body).toHaveProperty(REFRESH_TOKEN_NAME)
    })

    test('should be return 404 when otp is not verified', async () => {
      await prismaService.user.create({
        data: { email: 'test@test.com', name: 'Test', gender: 'MALE' },
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
    afterEach(async () => {
      await prismaService.user.deleteMany()
    })

    test('should be return 200 and user', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test',
          gender: 'MALE',
          isActive: true,
        },
      })

      const { accessToken } = authJwtsService.sign({ sub: 'test@test.com' })

      const response = await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toEqual({
        ...user,
        createdAt: user.createdAt.toISOString(),
      })
    })

    test('should be return 401 when no authorization header', async () => {
      await request(server).get('/auth/me').expect(401)
    })

    test('should be return 401 when invalid token provided', async () => {
      await request(server)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid')
        .expect(401)
    })
  })

  describe('POST /auth/update', () => {
    afterEach(async () => {
      await prismaService.user.deleteMany()
    })

    test('should be return 201 and new JWT pair with valid refresh token', async () => {
      await prismaService.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test',
          gender: 'MALE',
        },
      })

      const { refreshToken } = authJwtsService.sign({ sub: 'test@test.com' })

      const response = await request(server)
        .post('/auth/update')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(201)

      expect(response.body).toHaveProperty(ACCESS_TOKEN_NAME)
      expect(response.body).toHaveProperty(REFRESH_TOKEN_NAME)
    })

    test('should be return 401 when no refresh token provided', async () => {
      await request(server).post('/auth/update').expect(401)
    })

    test('should be return 401 when invalid refresh token provided', async () => {
      await request(server)
        .post('/auth/update')
        .set('Authorization', 'Bearer invalid')
        .expect(401)
    })
  })

  describe('POST /auth/logout', () => {
    afterEach(async () => {
      await prismaService.user.deleteMany()
    })

    test('should be return 200 and revoke token successfully', async () => {
      await prismaService.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test',
          gender: 'MALE',
        },
      })

      const { accessToken } = authJwtsService.sign({ sub: 'test@test.com' })

      await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    })

    test('should be return 401 when refresh token is invalid', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid')
        .expect(401)
    })
  })
})
