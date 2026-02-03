import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@/app.module'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { MailService } from '@/shared/mail/mail.service'
import { mock, MockProxy } from 'vitest-mock-extended'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let postgres: StartedPostgreSqlContainer
  let redis: StartedRedisContainer
  let mailService: MockProxy<MailService>

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer('postgres:18-alpine').start()
    redis = await new RedisContainer('redis/redis-stack:latest').start()
    mailService = mock<MailService>()

    const postgresUrl = postgres.getConnectionUri()
    const redisUrl = redis.getConnectionUrl()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await postgres.stop()
    await redis.stop()
  })

  describe('POST /auth/signup', () => {
    test('should be return 200 if a user with that email does not exist', async () => {})

    test('should be return 200 if a user with that email does not exist', async () => {})
  })

  describe('POST /auth/signin', () => {})

  describe('POST /auth/verify-otp', () => {})

  describe('GET /auth/me', () => {})

  describe('POST /auth/update', () => {})

  describe('POST /auth/logout', () => {})
})
