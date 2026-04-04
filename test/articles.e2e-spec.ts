import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { App } from 'supertest/types'
import { CreateArticleDto, UpdateArticleDto } from '@/articles/dtos'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { EncodedJwt } from '@/shared/types'
import { mock, MockProxy } from 'vitest-mock-extended'
import { MailService } from '@/mail/mail.service'
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
import { DataSource, Repository } from 'typeorm'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { Article } from '@/articles/entities'
import { getFakeHeadingNode, getFakeParagraphNode } from '@/test/utils'
import { Subsite } from '@/subsites/entities'

describe('Articles (e2e)', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let dataSource: DataSource
  let usersService: UsersService
  let articlesRepository: Repository<Article>
  let subsitesRepository: Repository<Subsite>
  let authJwtsService: AuthJwtsService
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
    articlesRepository = module.get<Repository<Article>>(
      getRepositoryToken(Article),
    )
    subsitesRepository = module.get<Repository<Subsite>>(
      getRepositoryToken(Subsite),
    )
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()

    await usersService.create({
      email: 'test@test.com',
      name: 'Test',
      gender: UserGender.Male,
    })
    await subsitesRepository.save({
      name: 'Test',
    })

    accessToken = authJwtsService.sign({ sub: 'test@test.com' }).accessToken
  }, 60000)

  afterAll(async () => {
    await app.close()
    await postgresContainer.stop()
    await redisContainer.stop()
  })

  describe('POST /articles', () => {
    afterEach(async () => {
      await dataSource.query('TRUNCATE TABLE articles RESTART IDENTITY CASCADE')
    })

    test('should return 201 and article', async () => {
      const body: CreateArticleDto = {
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      const result = await request(server)
        .post('/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      const article = JSON.parse(
        JSON.stringify(await articlesRepository.findOneBy({ id: 1 }))!,
      )

      expect(result.status).toBe(201)
      expect(result.body).toEqual({ ...article, ...body })
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
      await dataSource.query('TRUNCATE TABLE articles RESTART IDENTITY CASCADE')
    })

    test('should return 200 and article', async () => {
      await articlesRepository.save({
        authorId: 1,
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      })

      const article = JSON.parse(
        JSON.stringify(await articlesRepository.findOneBy({ id: 1 }))!,
      )

      const result = await request(server)
        .get('/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(result.status).toBe(200)
      expect(result.body).toEqual(article)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).get('/articles/1').expect(401)
    })
  })

  describe('GET /articles/users/1', () => {
    afterEach(async () => {
      await dataSource.query('TRUNCATE TABLE articles RESTART IDENTITY CASCADE')
    })

    test('should return 200 and a single page of user articles sort by rating and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.rating).toBe(9)
      expect(lastArticle.rating).toBe(0)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of user articles sort by rating and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.rating).toBe(0)
      expect(lastArticle.rating).toBe(9)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of user articles sort by createdAt and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.createdAt).toBe(new Date(9).toISOString())
      expect(lastArticle.createdAt).toBe(new Date(0).toISOString())
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of user articles sort by createdAt and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.createdAt).toBe(new Date(0).toISOString())
      expect(lastArticle.createdAt).toBe(new Date(9).toISOString())
      expect(cursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of user articles sort by rating and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.rating).toBe(19)
      expect(firstResponseLastArticle.rating).toBe(10)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/users/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.rating).toBe(9)
      expect(secondResponseLastArticle.rating).toBe(0)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of user articles sort by rating and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.rating).toBe(0)
      expect(firstResponseLastArticle.rating).toBe(9)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/users/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.rating).toBe(10)
      expect(secondResponseLastArticle.rating).toBe(19)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of user articles sort by createdAt and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result1 = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.createdAt).toBe(
        new Date(19).toISOString(),
      )
      expect(firstResponseLastArticle.createdAt).toBe(
        new Date(10).toISOString(),
      )
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/users/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.createdAt).toBe(
        new Date(9).toISOString(),
      )
      expect(secondResponseLastArticle.createdAt).toBe(
        new Date(0).toISOString(),
      )
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of user articles sort by createdAt and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result1 = await request(server)
        .get('/articles/users/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.createdAt).toBe(
        new Date(0).toISOString(),
      )
      expect(firstResponseLastArticle.createdAt).toBe(new Date(9).toISOString())
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/users/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.createdAt).toBe(
        new Date(10).toISOString(),
      )
      expect(secondResponseLastArticle.createdAt).toBe(
        new Date(19).toISOString(),
      )
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 400 if query is invalid', async () => {
      return request(server)
        .get('/articles/users/1')
        .query({ limit: 9 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).get('/articles/users/1').expect(401)
    })
  })

  describe('GET /articles/subsites/1', () => {
    afterEach(async () => {
      await dataSource.query('TRUNCATE TABLE articles RESTART IDENTITY CASCADE')
    })

    test('should return 200 and a single page of subsite articles sort by rating and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.rating).toBe(9)
      expect(lastArticle.rating).toBe(0)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of subsite articles sort by rating and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.rating).toBe(0)
      expect(lastArticle.rating).toBe(9)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of subsite articles sort by createdAt and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.createdAt).toBe(new Date(9).toISOString())
      expect(lastArticle.createdAt).toBe(new Date(0).toISOString())
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of subsite articles sort by createdAt and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Article[] = result.body.items
      const articlesCount = items.length
      const firstArticle = items[0]
      const lastArticle = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(articlesCount).toBe(10)
      expect(firstArticle.createdAt).toBe(new Date(0).toISOString())
      expect(lastArticle.createdAt).toBe(new Date(9).toISOString())
      expect(cursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of subsite articles sort by rating and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.rating).toBe(19)
      expect(firstResponseLastArticle.rating).toBe(10)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/subsites/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.rating).toBe(9)
      expect(secondResponseLastArticle.rating).toBe(0)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of subsite articles sort by rating and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.rating).toBe(0)
      expect(firstResponseLastArticle.rating).toBe(9)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/subsites/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.rating).toBe(10)
      expect(secondResponseLastArticle.rating).toBe(19)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of subsite articles sort by createdAt and order by DESC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result1 = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.createdAt).toBe(
        new Date(19).toISOString(),
      )
      expect(firstResponseLastArticle.createdAt).toBe(
        new Date(10).toISOString(),
      )
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/subsites/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.createdAt).toBe(
        new Date(9).toISOString(),
      )
      expect(secondResponseLastArticle.createdAt).toBe(
        new Date(0).toISOString(),
      )
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of subsite articles sort by createdAt and order by ASC', async () => {
      await articlesRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          subsiteId: 1,
          content: { type: 'doc', content: [getFakeHeadingNode()] },
          createdAt: new Date(i),
        })),
      )

      const result1 = await request(server)
        .get('/articles/subsites/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Article[] = result1.body.items
      const firstResponseArticlesCount = firstResponseItems.length
      const firstResponseFirstArticle = firstResponseItems[0]
      const firstResponseLastArticle = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseArticlesCount).toBe(10)
      expect(firstResponseFirstArticle.createdAt).toBe(
        new Date(0).toISOString(),
      )
      expect(firstResponseLastArticle.createdAt).toBe(new Date(9).toISOString())
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/articles/subsites/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Article[] = result2.body.items
      const secondResponseArticlesCount = secondResponseItems.length
      const secondResponseFirstArticle = secondResponseItems[0]
      const secondResponseLastArticle = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseArticlesCount).toBe(10)
      expect(secondResponseFirstArticle.createdAt).toBe(
        new Date(10).toISOString(),
      )
      expect(secondResponseLastArticle.createdAt).toBe(
        new Date(19).toISOString(),
      )
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 400 if query is invalid', async () => {
      const subsite = await subsitesRepository.save({ name: 'Main' })

      return request(server)
        .get(`/articles/subsites/${subsite.id}`)
        .query({ limit: 9 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)
    })

    test('should return 401 if user is not authenticated', async () => {
      const subsite = await subsitesRepository.save({ name: 'Main' })

      return request(server).get(`/articles/subsites/${subsite.id}`).expect(401)
    })
  })

  describe('PATCH /articles/1', () => {
    afterEach(async () => {
      await dataSource.query('TRUNCATE TABLE articles RESTART IDENTITY CASCADE')
    })

    test('should return 200 and article', async () => {
      await articlesRepository.save({
        authorId: 1,
        content: { type: 'doc', content: [getFakeHeadingNode()] },
      })

      const article = JSON.parse(
        JSON.stringify(await articlesRepository.findOneBy({ id: 1 }))!,
      )

      const body: UpdateArticleDto = {
        content: { type: 'doc', content: [getFakeParagraphNode()] },
      }

      const result = await request(server)
        .patch('/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(200)
      expect(result.body).toEqual({
        ...article,
        ...body,
        updatedAt: result.body.updatedAt,
      })
    })

    test('should return 401 if user is not authenticated', async () => {
      const body: UpdateArticleDto = {
        content: { type: 'doc', content: [getFakeParagraphNode()] },
      }

      return request(server).patch('/articles/1').send(body).expect(401)
    })
  })
})
