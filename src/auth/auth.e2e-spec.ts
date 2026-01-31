import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@/app.module'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let postgres: StartedPostgreSqlContainer
  let redis: StartedRedisContainer

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer('postgres:15-alpine').start()
    redis = await new RedisContainer('redis:7-alpine').start()

    const postgresUrl = postgres.getConnectionUri()
    const redisUrl = redis.getConnectionUrl()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )

    await app.init()
  })

  afterAll(async () => {
    await app.close()
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
