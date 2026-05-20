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
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { PrismaClient } from '@/prisma/types'
import { PRISMA_CLIENT } from '@/prisma/consts'
import { UserGender } from '@/users/enums'
import { execSync } from 'node:child_process'
import { Article } from '@/articles/types'
import { createArticle, createArticles, truncateArticles } from './utils'
import { getFakeHeadingNode, getFakeTextNode } from '@/test/utils'
import { CursorPaginateMeta } from '@/lib/prisma/extensions/cursor-pagination/types'

describe('Articles (e2e)', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let prismaClient: PrismaClient
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

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    prismaClient = module.get<PrismaClient>(PRISMA_CLIENT)
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()

    accessToken = authJwtsService.sign({ sub: 'test@test.com' }).accessToken

    execSync('yarn prisma db push')

    await prismaClient.user.createMany({
      data: [
        {
          email: 'test@test.com',
          name: 'Test',
          gender: UserGender.male,
        },
        {
          email: 'test2@test.com',
          name: 'Test 2',
          gender: UserGender.male,
        },
      ],
    })

    await prismaClient.subsite.createMany({
      data: [
        {
          name: 'Test',
        },
        {
          name: 'Test 2',
        },
      ],
    })
  }, 60000)

  afterAll(async () => {
    await app.close()
    await postgresContainer.stop()
    await redisContainer.stop()
  })

  describe('POST /articles', () => {
    afterEach(async () => await truncateArticles(prismaClient))

    test('should return an article', async () => {
      const body: CreateArticleDto = {
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
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
          content: [getFakeTextNode()],
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

  describe('GET /articles', () => {
    describe('user', () => {
      describe('1 page', () => {
        beforeEach(async () => await createArticles(prismaClient, 10))
        afterEach(async () => await truncateArticles(prismaClient))

        test('should return articles sorted by rating and ordered by DESC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before, hasNextPage, hasPreviousPage } = result.body
            .meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.rating).toBe(9)
          expect(lastArticle.rating).toBe(0)
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
          expect(hasNextPage).toBeFalsy()
          expect(hasPreviousPage).toBeFalsy()
        })

        test('should return articles sorted by rating and ordered by ASC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before, hasNextPage, hasPreviousPage } = result.body
            .meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.rating).toBe(0)
          expect(lastArticle.rating).toBe(9)
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
          expect(hasNextPage).toBeFalsy()
          expect(hasPreviousPage).toBeFalsy()
        })

        test('should return articles sorted by createdAt and ordered by DESC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before, hasNextPage, hasPreviousPage } = result.body
            .meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.createdAt).toBe(new Date(9).toISOString())
          expect(lastArticle.createdAt).toBe(new Date(0).toISOString())
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
          expect(hasNextPage).toBeFalsy()
          expect(hasPreviousPage).toBeFalsy()
        })

        test('should return articles sorted by createdAt and ordered by ASC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before, hasNextPage, hasPreviousPage } = result.body
            .meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.createdAt).toBe(new Date(0).toISOString())
          expect(lastArticle.createdAt).toBe(new Date(9).toISOString())
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
          expect(hasNextPage).toBeFalsy()
          expect(hasPreviousPage).toBeFalsy()
        })
      })

      describe('2 pages', () => {
        beforeEach(async () => await createArticles(prismaClient, 20))
        afterEach(async () => await truncateArticles(prismaClient))

        test('should return articles sorted by rating and ordered by DESC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const {
            after: firstResponseAfter,
            before: firstResponseBefore,
            hasNextPage: firstResponseHasNextPage,
            hasPreviousPage: firstResponseHasPreviousPage,
          } = firstResponse.body.meta as CursorPaginateMeta

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const {
            after: secondResponseAfter,
            before: secondResponseBefore,
            hasNextPage: secondResponseHasNextPage,
            hasPreviousPage: secondResponseHasPreviousPage,
          } = secondResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.rating).toBe(19)
          expect(firstResponseLastArticle.rating).toBe(10)
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()
          expect(firstResponseHasNextPage).toBeTruthy()
          expect(firstResponseHasPreviousPage).toBeFalsy()
          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.rating).toBe(9)
          expect(secondResponseLastArticle.rating).toBe(0)
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
          expect(secondResponseHasNextPage).toBeFalsy()
          expect(secondResponseHasPreviousPage).toBeTruthy()
        })

        test('should return articles sorted by rating and ordered by ASC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({ authorId: 1, limit: 10, orderBy: 'asc', sortBy: 'rating' })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const {
            after: firstResponseAfter,
            before: firstResponseBefore,
            hasNextPage: firstResponseHasNextPage,
            hasPreviousPage: firstResponseHasPreviousPage,
          } = firstResponse.body.meta as CursorPaginateMeta

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const {
            after: secondResponseAfter,
            before: secondResponseBefore,
            hasNextPage: secondResponseHasNextPage,
            hasPreviousPage: secondResponseHasPreviousPage,
          } = secondResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.rating).toBe(0)
          expect(firstResponseLastArticle.rating).toBe(9)
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()
          expect(firstResponseHasNextPage).toBeTruthy()
          expect(firstResponseHasPreviousPage).toBeFalsy()
          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.rating).toBe(10)
          expect(secondResponseLastArticle.rating).toBe(19)
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
          expect(secondResponseHasNextPage).toBeFalsy()
          expect(secondResponseHasPreviousPage).toBeTruthy()
        })

        test('should return articles sorted by createdAt and ordered by DESC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const {
            after: firstResponseAfter,
            before: firstResponseBefore,
            hasNextPage: firstResponseHasNextPage,
            hasPreviousPage: firstResponseHasPreviousPage,
          } = firstResponse.body.meta as CursorPaginateMeta

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const {
            after: secondResponseAfter,
            before: secondResponseBefore,
            hasNextPage: secondResponseHasNextPage,
            hasPreviousPage: secondResponseHasPreviousPage,
          } = secondResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.createdAt).toBe(
            new Date(19).toISOString(),
          )
          expect(firstResponseLastArticle.createdAt).toBe(
            new Date(10).toISOString(),
          )
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()
          expect(firstResponseHasNextPage).toBeTruthy()
          expect(firstResponseHasPreviousPage).toBeFalsy()
          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.createdAt).toBe(
            new Date(9).toISOString(),
          )
          expect(secondResponseLastArticle.createdAt).toBe(
            new Date(0).toISOString(),
          )
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
          expect(secondResponseHasNextPage).toBeFalsy()
          expect(secondResponseHasPreviousPage).toBeTruthy()
        })

        test('should return articles sorted by createdAt and ordered by ASC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const {
            after: firstResponseAfter,
            before: firstResponseBefore,
            hasNextPage: firstResponseHasNextPage,
            hasPreviousPage: firstResponseHasPreviousPage,
          } = firstResponse.body.meta as CursorPaginateMeta

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const {
            after: secondResponseAfter,
            before: secondResponseBefore,
            hasNextPage: secondResponseHasNextPage,
            hasPreviousPage: secondResponseHasPreviousPage,
          } = secondResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.createdAt).toBe(
            new Date(0).toISOString(),
          )
          expect(firstResponseLastArticle.createdAt).toBe(
            new Date(9).toISOString(),
          )
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()
          expect(firstResponseHasNextPage).toBeTruthy()
          expect(firstResponseHasPreviousPage).toBeFalsy()
          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.createdAt).toBe(
            new Date(10).toISOString(),
          )
          expect(secondResponseLastArticle.createdAt).toBe(
            new Date(19).toISOString(),
          )
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
          expect(secondResponseHasNextPage).toBeFalsy()
          expect(secondResponseHasPreviousPage).toBeTruthy()
        })
      })

      test('should return empty articles if a user is not have an articles', async () => {
        const result = await request(server)
          .get('/articles')
          .query({
            authorId: 2,
            limit: 10,
            orderBy: 'desc',
            sortBy: 'rating',
          })
          .set('Authorization', `Bearer ${accessToken}`)

        const status = result.status
        const items: Article[] = result.body.items
        const articlesCount = items.length
        const { after, before } = result.body.meta as CursorPaginateMeta

        expect(status).toBe(200)
        expect(articlesCount).toBe(0)
        expect(after).toBeNull()
        expect(before).toBeNull()
      })
    })

    describe('subsite', () => {
      describe('1 page', () => {
        beforeEach(async () => await createArticles(prismaClient, 10))
        afterEach(async () => await truncateArticles(prismaClient))

        test('should return articles sorted by rating and ordered by DESC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before } = result.body.meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.rating).toBe(9)
          expect(lastArticle.rating).toBe(0)
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
        })

        test('should return articles sorted by rating and ordered by ASC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before } = result.body.meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.rating).toBe(0)
          expect(lastArticle.rating).toBe(9)
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
        })

        test('should return articles sorted by createdAt and ordered by DESC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before } = result.body.meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.createdAt).toBe(new Date(9).toISOString())
          expect(lastArticle.createdAt).toBe(new Date(0).toISOString())
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
        })

        test('should return articles sorted by createdAt and ordered by ASC', async () => {
          const result = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Article[] = result.body.items
          const articlesCount = items.length
          const firstArticle = items[0]
          const lastArticle = items[9]
          const { after, before } = result.body.meta as CursorPaginateMeta

          expect(status).toBe(200)
          expect(articlesCount).toBe(10)
          expect(firstArticle.createdAt).toBe(new Date(0).toISOString())
          expect(lastArticle.createdAt).toBe(new Date(9).toISOString())
          expect(after).not.toBeNull()
          expect(before).not.toBeNull()
        })
      })

      describe('2 pages', () => {
        beforeEach(async () => await createArticles(prismaClient, 20))
        afterEach(async () => await truncateArticles(prismaClient))

        test('should return articles sorted by rating and ordered by DESC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.rating).toBe(19)
          expect(firstResponseLastArticle.rating).toBe(10)
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.rating).toBe(9)
          expect(secondResponseLastArticle.rating).toBe(0)
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })

        test('should return articles sorted by rating and ordered by ASC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.rating).toBe(0)
          expect(firstResponseLastArticle.rating).toBe(9)
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.rating).toBe(10)
          expect(secondResponseLastArticle.rating).toBe(19)
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })

        test('should return articles sorted by createdAt and ordered by DESC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.createdAt).toBe(
            new Date(19).toISOString(),
          )
          expect(firstResponseLastArticle.createdAt).toBe(
            new Date(10).toISOString(),
          )
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.createdAt).toBe(
            new Date(9).toISOString(),
          )
          expect(secondResponseLastArticle.createdAt).toBe(
            new Date(0).toISOString(),
          )
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })

        test('should return articles sorted by createdAt and ordered by ASC', async () => {
          const firstResponse = await request(server)
            .get('/articles')
            .query({
              subsiteId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = firstResponse.status
          const firstResponseItems: Article[] = firstResponse.body.items
          const firstResponseArticlesCount = firstResponseItems.length
          const firstResponseFirstArticle = firstResponseItems[0]
          const firstResponseLastArticle = firstResponseItems[9]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseArticlesCount).toBe(10)
          expect(firstResponseFirstArticle.createdAt).toBe(
            new Date(0).toISOString(),
          )
          expect(firstResponseLastArticle.createdAt).toBe(
            new Date(9).toISOString(),
          )
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).not.toBeNull()

          const secondResponse = await request(server)
            .get('/articles')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = secondResponse.status
          const secondResponseItems: Article[] = secondResponse.body.items
          const secondResponseArticlesCount = secondResponseItems.length
          const secondResponseFirstArticle = secondResponseItems[0]
          const secondResponseLastArticle = secondResponseItems[9]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseArticlesCount).toBe(10)
          expect(secondResponseFirstArticle.createdAt).toBe(
            new Date(10).toISOString(),
          )
          expect(secondResponseLastArticle.createdAt).toBe(
            new Date(19).toISOString(),
          )
          expect(secondResponseAfter).not.toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })
      })

      test('should return empty articles if a subsite is not have an articles', async () => {
        const result = await request(server)
          .get('/articles')
          .query({
            subsiteId: 2,
            limit: 10,
            orderBy: 'desc',
            sortBy: 'rating',
          })
          .set('Authorization', `Bearer ${accessToken}`)

        const status = result.status
        const items: Article[] = result.body.items
        const articlesCount = items.length
        const { after, before } = result.body.meta as CursorPaginateMeta

        expect(status).toBe(200)
        expect(articlesCount).toBe(0)
        expect(after).toBeNull()
        expect(before).toBeNull()
      })
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).get('/articles/1').expect(401)
    })
  })

  describe('PATCH /articles/1', () => {
    afterEach(async () => await truncateArticles(prismaClient))

    test('should return an article', async () => {
      const originalArticle = await createArticle(prismaClient)

      const body: UpdateArticleDto = {
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      const updatedArticle = { ...originalArticle, ...body }

      const result = await request(server)
        .patch('/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(200)
      expect(result.body.content).toEqual(updatedArticle.content)
    })

    test('should return 400 if a doc content field contains not allowed node', async () => {
      await createArticle(prismaClient)

      const body: UpdateArticleDto = {
        content: {
          type: 'doc',
          content: [getFakeTextNode()],
        },
      }

      return request(server)
        .patch('/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).patch('/articles/1').expect(401)
    })
  })

  describe('DELETE /articles/1', () => {
    afterEach(async () => await truncateArticles(prismaClient))

    test('should return an article', async () => {
      const deletedArticle = await createArticle(prismaClient)

      const result = await request(server)
        .delete('/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(result.status).toBe(200)
      expect(result.body).toEqual(deletedArticle)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).delete('/articles/1').expect(401)
    })
  })
})
