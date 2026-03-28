import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { App } from 'supertest/types'
import { CreateArticleDto } from '@/articles/dtos'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { EncodedJwt } from '@/shared/types'
import { mock, MockProxy } from 'vitest-mock-extended'
import { MailService } from '@/mail/mail.service'
import { User } from '@/users/entities'
import { UserGender } from '@/users/enums'
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { TestTypeOrmModule } from './modules'
import { UsersService } from '@/users/users.service'
import { ArticlesService } from '@/articles/articles.service'
import { DataSource } from 'typeorm'
import { getDataSourceToken } from '@nestjs/typeorm'

describe('Articles (e2e)', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let dataSource: DataSource
  let usersService: UsersService
  let articlesService: ArticlesService
  let authJwtsService: AuthJwtsService
  let user: User
  let accessToken: EncodedJwt

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer(
      'postgres:18-alpine',
    ).start()
    redisContainer = await new RedisContainer(
      'redis/redis-stack:7.2.0-v20',
    ).start()

    process.env.DATABASE_URL = postgresContainer.getConnectionUri()
    process.env.REDIS_URL = redisContainer.getConnectionUrl()

    mailService = mock<MailService>()

    initializeTransactionalContext({
      storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
    })

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestTypeOrmModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    dataSource = module.get<DataSource>(getDataSourceToken())
    usersService = module.get<UsersService>(UsersService)
    articlesService = module.get<ArticlesService>(ArticlesService)
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()

    user = await usersService.create({
      email: 'test@test.com',
      name: 'Test',
      gender: UserGender.Male,
    })

    accessToken = authJwtsService.sign({ sub: user.email }).accessToken
  }, 60000)

  afterAll(async () => {
    await app.close()
    await postgresContainer.stop()
    await redisContainer.stop()
  })

  describe('POST /articles', () => {
    afterEach(async () => {
      await dataSource.query('TRUNCATE TABLE article RESTART IDENTITY CASCADE')
    })

    test('should return 201 and article', async () => {
      const body: CreateArticleDto = {
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Test' }],
            },
          ],
        },
      }

      const result = await request(server)
        .post('/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(201)
      expect(result.body).toEqual({ ...result.body, ...body })
    })

    test('should return 400 if body is empty', async () => {
      return request(server)
        .post('/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400)
    })

    test('should return 400 if body content field is empty', async () => {
      const body: CreateArticleDto = {
        content: {},
      }

      return request(server)
        .post('/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 400 if doc node content field contains not allowed node', async () => {
      const body: CreateArticleDto = {
        content: {
          type: 'doc',
          content: [{ type: 'text', text: 'Test' }],
        },
      }

      return request(server)
        .post('/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).post('/articles').expect(401)
    })
  })

  describe('GET /articles/1', () => {
    afterEach(async () => {
      await dataSource.query('TRUNCATE TABLE article RESTART IDENTITY CASCADE')
    })

    test('should return 200 and article', async () => {
      const article = JSON.parse(
        JSON.stringify(
          await articlesService.create({
            authorId: 1,
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Test' }],
                },
              ],
            },
          }),
        ),
      )

      return request(server)
        .get('/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(article)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).get('/articles/1').expect(401)
    })
  })
})
