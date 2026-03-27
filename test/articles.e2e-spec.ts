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
import { DataSource, Repository } from 'typeorm'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { CreateCommentDto } from '@/comments/dtos'
import { Comment } from '@/comments/entities'
import { getFakeInt } from '@/test/utils'

describe('Articles (e2e)', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let dataSource: DataSource
  let usersService: UsersService
  let articlesService: ArticlesService
  let commentsRepository: Repository<Comment>
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
    commentsRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    )
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

  describe('POST /articles/1/comments', () => {
    beforeEach(async () => {
      await articlesService.create({
        authorId: 1,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Test' }],
            },
          ],
        },
      })
    })

    afterEach(async () => {
      await dataSource.query(
        'TRUNCATE TABLE article, comments RESTART IDENTITY CASCADE',
      )
    })

    test('should return 201 and create a root comment', async () => {
      const body: CreateCommentDto = {
        content: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      }

      return request(server)
        .post('/articles/1/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(201)
    })

    test('should return 201 and create a children comment', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
        ],
      })

      const body: CreateCommentDto = {
        parentCommentId: 1,
        content: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      }

      return request(server)
        .post('/articles/1/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(201)
    })

    test('should return 400 if body is empty', async () => {
      return request(server)
        .post('/articles/1/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400)
    })

    test('should return 400 if body content field is empty', async () => {
      const body: CreateCommentDto = {
        content: {},
      }

      return request(server)
        .post('/articles/1/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 400 if doc node content field contains not allowed node', async () => {
      const body: CreateCommentDto = {
        content: {
          type: 'doc',
          content: [
            { type: 'heading', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      }

      return request(server)
        .post('/articles/1/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 401 if user is not authenticated', async () => {
      const body: CreateCommentDto = {
        content: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      }

      return request(server).post('/articles/1/comments').send(body).expect(401)
    })
  })

  describe('GET /articles/1/comments', () => {
    beforeEach(async () => {
      await articlesService.create({
        authorId: 1,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Test' }],
            },
          ],
        },
      })
    })

    afterEach(async () => {
      await dataSource.query(
        'TRUNCATE TABLE article, comments RESTART IDENTITY CASCADE',
      )
    })

    test('should return 200 and load 2 pages', async () => {
      await Promise.all(
        Array.from({ length: 100 }).map(
          async () =>
            await commentsRepository.save({
              authorId: 1,
              articleId: 1,
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Test' }],
                  },
                ],
              },
              rating: getFakeInt(),
            }),
        ),
      )

      const result1 = await request(server)
        .get('/articles/1/comments?limit=50')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(result1.status).toBe(200)
      expect(result1.body.items.length).toEqual(50)
      expect(result1.body.meta.cursor).not.toBeNull()

      console.log('page 1: ', result1.body)

      const result2 = await request(server)
        .get(`/articles/1/comments?limit=50&cursor=${result1.body.meta.cursor}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(result2.status).toBe(200)
      expect(result2.body.items.length).toEqual(50)
      expect(result2.body.meta.cursor).toBeNull()
    })
  })
})
