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
import { OtpsService } from '@/otps/otps.service'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { Repository } from 'typeorm'
import { User } from '@/users/entities'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UserGender } from '@/users/enums'
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional'

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let usersRepository: Repository<User>
  let otpsService: OtpsService
  let authJwtsService: AuthJwtsService

  beforeAll(async () => {
    execSync('docker compose -f compose.e2e.yaml up -d')

    initializeTransactionalContext({
      storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
    })

    mailService = mock<MailService>()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
    otpsService = module.get<OtpsService>(OtpsService)
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    execSync('docker compose -f compose.e2e.yaml down')
  })

  describe('POST /auth/signup', () => {
    afterEach(async () => {
      await usersRepository.deleteAll()
    })

    test('should return 201 when user with some email does not exist', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
      }

      await request(server).post('/auth/signup').send(body).expect(201)
    })

    test('should return 403 when user with some email already exists', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
      })

      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
      }

      await request(server).post('/auth/signup').send(body).expect(403)
    })

    test('should return 400 when email is empty', async () => {
      const body: SignUpDto = {
        email: '',
        name: 'Test',
        gender: UserGender.MALE,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when email is not email', async () => {
      const body: SignUpDto = {
        email: 'not email',
        name: 'Test',
        gender: UserGender.MALE,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when the email is longer than 100 characters', async () => {
      const body: SignUpDto = {
        email:
          'PMXWwZOQDyTyKiHDViGLscBnRCWoalwESoXWShXytJZBXIhAeJGTdhSiSmZuORRuzUcGyzrxjvYttqIOLTZLWhMfAfna@test.com',
        name: 'Test',
        gender: UserGender.MALE,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when name is empty', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: '',
        gender: UserGender.MALE,
      }

      await request(server).post('/auth/signup').send(body).expect(400)
    })

    test('should return 400 when the name is longer than 100 characters', async () => {
      const body: SignUpDto = {
        email: 'test@test.com',
        name: 'MYpmYTLaqoDuasawqeIxGgaqgkwBLjqGogJYxDfyEDUTnTpUkerWnmXuehNzvYhkmjHDZIvwZYZNCIETEqDjzOnMSLYNDDJcvBdxh',
        gender: UserGender.MALE,
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
    afterEach(async () => {
      await usersRepository.deleteAll()
    })

    test('should return 201 when user exists and is active', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
        isActive: true,
      })

      const body: SignInDto = { email: 'test@test.com' }

      await request(server).post('/auth/signin').send(body).expect(201)
    })

    test('should return 403 when user does not exist', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
      })

      const body: SignInDto = { email: 'random@random.com' }

      await request(server).post('/auth/signin').send(body).expect(403)
    })

    test('should return 403 when user exists but is not active', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
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

  describe('POST /auth/verify-otp', () => {
    afterEach(async () => {
      await usersRepository.deleteAll()
    })

    test('should return 201 and auth-jwts if signup otp is verified', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
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

    test('should return 201 and auth-jwts if signin otp is verified', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
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

    test('should return 404 when otp is not verified', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
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
      await usersRepository.deleteAll()
    })

    test('should return 200 and user', async () => {
      const user = await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
        isActive: true,
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

    test('should return 401 when no authorization header', async () => {
      await request(server).get('/auth/me').expect(401)
    })

    test('should return 401 when invalid token provided', async () => {
      await request(server)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid')
        .expect(401)
    })
  })

  describe('POST /auth/update', () => {
    afterEach(async () => {
      await usersRepository.deleteAll()
    })

    test('should return 201 and new auth jwts pair with valid refresh token', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
      })

      const { refreshToken } = authJwtsService.sign({ sub: 'test@test.com' })

      const response = await request(server)
        .post('/auth/update')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(201)

      expect(response.body).toHaveProperty(ACCESS_TOKEN_NAME)
      expect(response.body).toHaveProperty(REFRESH_TOKEN_NAME)
    })

    test('should return 401 when no refresh token provided', async () => {
      await request(server).post('/auth/update').expect(401)
    })

    test('should return 401 when invalid refresh token provided', async () => {
      await request(server)
        .post('/auth/update')
        .set('Authorization', 'Bearer invalid')
        .expect(401)
    })
  })

  describe('POST /auth/logout', () => {
    afterEach(async () => {
      await usersRepository.deleteAll()
    })

    test('should return 200 and revoke token successfully', async () => {
      await usersRepository.save({
        email: 'test@test.com',
        name: 'Test',
        gender: UserGender.MALE,
      })

      const { accessToken } = authJwtsService.sign({ sub: 'test@test.com' })

      await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    })

    test('should return 401 when refresh token is invalid', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid')
        .expect(401)
    })
  })
})
