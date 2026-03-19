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
import { DataSource, Repository } from 'typeorm'
import { Article } from '@/articles/entities'
import { User } from '@/users/entities'
import { UserGender } from '@/users/enums'
import { getRepositoryToken } from '@nestjs/typeorm'
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'

describe('ArticlesController (e2e)', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let usersRepository: Repository<User>
  let articlesRepository: Repository<Article>
  let authJwtsService: AuthJwtsService
  let user: User
  let accessToken: EncodedJwt
  let dataSource: DataSource

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer(
      'postgres:18-alpine',
    ).start()
    redisContainer = await new RedisContainer(
      'redis/redis-stack:7.2.0-v20',
    ).start()

    process.env.DATABASE_URL = postgresContainer.getConnectionUri()
    process.env.REDIS_URL = redisContainer.getConnectionUrl()

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
    articlesRepository = module.get<Repository<Article>>(
      getRepositoryToken(Article),
    )
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)
    dataSource = module.get<DataSource>(DataSource)

    await dataSource.synchronize()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()

    user = await usersRepository.save({
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
      await articlesRepository.query(
        'TRUNCATE TABLE "article" RESTART IDENTITY CASCADE',
      )
    })

    test('should return 200 and article', async () => {
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

    test('should return 400 if body content field contains not allowed node', async () => {
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
    test('should return 200 and article', async () => {
      const article = await articlesRepository.save({
        author: user,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Test' }],
            },
          ],
        },
      })

      return request(server)
        .get('/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect({
          ...article,
          author: {
            ...article.author,
            createdAt: article.author.createdAt.toISOString(),
            updatedAt: article.author.updatedAt.toISOString(),
          },
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.createdAt.toISOString(),
        })
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).get('/articles/1').expect(401)
    })
  })
})
