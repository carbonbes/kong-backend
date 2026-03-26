import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { App } from 'supertest/types'
import { mock, MockProxy } from 'vitest-mock-extended'
import { MailService } from '@/mail/mail.service'
import { Repository } from 'typeorm'
import { User } from '@/users/entities'
import { Article } from '@/articles/entities'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { EncodedJwt } from '@/shared/types'
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { TestTypeOrmModule } from './modules'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UserGender } from '@/users/enums'
import { Comment } from '@/comments/entities'
import { CreateCommentDto } from '@/comments/dtos'
import request from 'supertest'

describe('CommentController (e2e)', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let usersRepository: Repository<User>
  let articlesRepository: Repository<Article>
  let commentsRepository: Repository<Comment>
  let authJwtsService: AuthJwtsService
  let user: User
  let article: Article
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

    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
    articlesRepository = module.get<Repository<Article>>(
      getRepositoryToken(Article),
    )
    commentsRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    )
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()

    user = await usersRepository.save({
      email: 'test@test.com',
      name: 'Test',
      gender: UserGender.Male,
    })

    article = await articlesRepository.save({
      authorId: user.id,
      content: [
        {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    })

    accessToken = authJwtsService.sign({ sub: user.email }).accessToken
  }, 60000)

  afterAll(async () => {
    await app.close()
    await postgresContainer.stop()
    await redisContainer.stop()
  })

  describe('POST /comments', () => {
    afterEach(async () => {
      await commentsRepository.query(
        'TRUNCATE TABLE "comment" RESTART IDENTITY CASCADE',
      )
    })

    test('should create a root comment and return 200', async () => {
      const body: CreateCommentDto = {
        articleId: 1,
        content: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      }

      return request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(201)
    })

    test('should create a children comment and return 200', async () => {
      await commentsRepository.save({
        articleId: 1,
        authorId: 1,
        content: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      })

      const body: CreateCommentDto = {
        articleId: 1,
        parentCommentId: 1,
        content: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      }

      return request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(201)
    })

    test('should return 400 if the specific article is not found', async () => {
      const body: CreateCommentDto = {
        articleId: 2,
        content: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      }

      return request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })
  })
})
