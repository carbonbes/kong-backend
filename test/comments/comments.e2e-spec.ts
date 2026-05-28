import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { App } from 'supertest/types'
import { mock, MockProxy } from 'vitest-mock-extended'
import { MailService } from '@/mail/mail.service'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { EncodedJwt } from '@/shared/types'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import {
  getFakeBlockquoteNode,
  getFakeHeadingNode,
  getFakeParagraphNode,
} from '@/test/utils'
import { CreateCommentDto, UpdateCommentDto } from '@/comments/dtos'
import request from 'supertest'
import { PrismaClient } from '@/prisma/types'
import { PRISMA_CLIENT } from '@/prisma/consts'
import { Comment } from '@/comments/types'
import { JSONContent } from '@tiptap/core'
import { execSync } from 'node:child_process'
import { UserGender } from '@/users/enums'
import { createComment, createComments, truncateComments } from './utils'
import { CursorPaginateMeta } from '@/lib/prisma/extensions/cursor-pagination/types'

describe('Comments (e2e)', () => {
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

    await prismaClient.article.createMany({
      data: [
        {
          authorId: 1,
          content: {
            type: 'doc',
            content: [getFakeHeadingNode() as JSONContent],
          },
        },
        {
          authorId: 1,
          content: {
            type: 'doc',
            content: [getFakeHeadingNode() as JSONContent],
          },
        },
      ],
    })
  }, 60000)

  afterAll(async () => {
    await app.close()
    await postgresContainer.stop()
    await redisContainer.stop()
  })

  describe('POST /comments', () => {
    afterEach(async () => await truncateComments(prismaClient))

    test('should return a root comment', async () => {
      const body: CreateCommentDto = {
        articleId: 1,
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      const response = await request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      const comment = response.body as Comment

      expect(response.status).toBe(201)
      expect(comment.parentCommentId).toBeNull()
      expect(comment.content).toEqual(body.content)
    })

    test('should return a child comment', async () => {
      await createComment(prismaClient)

      const body: CreateCommentDto = {
        articleId: 1,
        parentCommentId: 1,
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      const response = await request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      const comment = response.body as Comment

      expect(response.status).toBe(201)
      expect(comment.parentCommentId).toBe(1)
      expect(comment.content).toEqual(body.content)
    })

    test('should return 400 if a article is not found', async () => {
      const body: CreateCommentDto = {
        articleId: 2,
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      return request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 400 if a parent comment is not found', async () => {
      const body: CreateCommentDto = {
        articleId: 1,
        parentCommentId: 2,
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      return request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 400 if a doc content field contains not allowed node', async () => {
      const body: CreateCommentDto = {
        articleId: 1,
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      return request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 401 if a user is not authenticated', async () => {
      const body: CreateCommentDto = {
        articleId: 1,
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      return request(server).post('/comments').send(body).expect(401)
    })
  })

  describe('GET /comments', () => {
    describe('article', () => {
      describe('root comments', () => {
        describe('1 page', () => {
          beforeEach(async () => await createComments(prismaClient, 10))
          afterEach(async () => await truncateComments(prismaClient))

          test('should return comments sorted by rating and ordered by DESC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(items[0].rating).toBe(9)
            expect(items[9].rating).toBe(0)
            expect(after).toBeNull()
            expect(before).toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(items[0].rating).toBe(0)
            expect(items[9].rating).toBe(9)
            expect(after).toBeNull()
            expect(before).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(items[0].createdAt).toBe(new Date(9).toISOString())
            expect(items[9].createdAt).toBe(new Date(0).toISOString())
            expect(after).toBeNull()
            expect(before).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(items[0].createdAt).toBe(new Date(0).toISOString())
            expect(items[9].createdAt).toBe(new Date(9).toISOString())
            expect(after).toBeNull()
            expect(before).toBeNull()
          })
        })

        describe('2 pages', () => {
          beforeEach(async () => await createComments(prismaClient, 20))
          afterEach(async () => await truncateComments(prismaClient))

          test('should return comments sorted by rating and ordered by DESC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].rating).toBe(19)
            expect(firstResponseItems[9].rating).toBe(10)
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].rating).toBe(9)
            expect(secondResponseItems[9].rating).toBe(0)
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].rating).toBe(0)
            expect(firstResponseItems[9].rating).toBe(9)
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].rating).toBe(10)
            expect(secondResponseItems[9].rating).toBe(19)
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].createdAt).toBe(
              new Date(19).toISOString(),
            )
            expect(firstResponseItems[9].createdAt).toBe(
              new Date(10).toISOString(),
            )
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].createdAt).toBe(
              new Date(9).toISOString(),
            )
            expect(secondResponseItems[9].createdAt).toBe(
              new Date(0).toISOString(),
            )
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].createdAt).toBe(
              new Date(0).toISOString(),
            )
            expect(firstResponseItems[9].createdAt).toBe(
              new Date(9).toISOString(),
            )
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].createdAt).toBe(
              new Date(10).toISOString(),
            )
            expect(secondResponseItems[9].createdAt).toBe(
              new Date(19).toISOString(),
            )
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })
        })
      })

      describe('child comments', () => {
        describe('1 page', () => {
          beforeEach(async () => {
            await createComment(prismaClient)
            await createComments(prismaClient, 10, 1)
          })

          afterEach(async () => await truncateComments(prismaClient))

          test('should return comments sorted by rating and ordered by DESC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            expect(items[0].rating).toBe(9)
            expect(items[9].rating).toBe(0)
            expect(after).toBeNull()
            expect(before).toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            expect(items[0].rating).toBe(0)
            expect(items[9].rating).toBe(9)
            expect(after).toBeNull()
            expect(before).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            expect(items[0].createdAt).toBe(new Date(9).toISOString())
            expect(items[9].createdAt).toBe(new Date(0).toISOString())
            expect(after).toBeNull()
            expect(before).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const response = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const items = response.body.items as Comment[]
            const { after, before } = response.body.meta as CursorPaginateMeta

            expect(response.status).toBe(200)
            expect(items.length).toBe(10)
            expect(items[0].createdAt).toBe(new Date(0).toISOString())
            expect(items[9].createdAt).toBe(new Date(9).toISOString())
            expect(after).toBeNull()
            expect(before).toBeNull()
          })
        })

        describe('2 pages', () => {
          beforeEach(async () => {
            await createComment(prismaClient)
            await createComments(prismaClient, 20, 1)
          })

          afterEach(async () => await truncateComments(prismaClient))

          test('should return comments sorted by rating and ordered by DESC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].rating).toBe(19)
            expect(firstResponseItems[9].rating).toBe(10)
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].rating).toBe(9)
            expect(secondResponseItems[9].rating).toBe(0)
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].rating).toBe(0)
            expect(firstResponseItems[9].rating).toBe(9)
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].rating).toBe(10)
            expect(secondResponseItems[9].rating).toBe(19)
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].createdAt).toBe(
              new Date(19).toISOString(),
            )
            expect(firstResponseItems[9].createdAt).toBe(
              new Date(10).toISOString(),
            )
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].createdAt).toBe(
              new Date(9).toISOString(),
            )
            expect(secondResponseItems[9].createdAt).toBe(
              new Date(0).toISOString(),
            )
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const firstResponse = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseItems = firstResponse.body.items as Comment[]
            const { after: firstResponseAfter, before: firstResponseBefore } =
              firstResponse.body.meta as CursorPaginateMeta

            expect(firstResponse.status).toBe(200)
            expect(firstResponseItems.length).toBe(10)
            expect(firstResponseItems[0].createdAt).toBe(
              new Date(0).toISOString(),
            )
            expect(firstResponseItems[9].createdAt).toBe(
              new Date(9).toISOString(),
            )
            expect(firstResponseAfter).not.toBeNull()
            expect(firstResponseBefore).toBeNull()

            const secondResponse = await request(server)
              .get('/comments')
              .query({
                after: firstResponseAfter,
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseItems = secondResponse.body.items as Comment[]
            const { after: secondResponseAfter, before: secondResponseBefore } =
              secondResponse.body.meta as CursorPaginateMeta

            expect(secondResponse.status).toBe(200)
            expect(secondResponseItems.length).toBe(10)
            expect(secondResponseItems[0].createdAt).toBe(
              new Date(10).toISOString(),
            )
            expect(secondResponseItems[9].createdAt).toBe(
              new Date(19).toISOString(),
            )
            expect(secondResponseAfter).toBeNull()
            expect(secondResponseBefore).not.toBeNull()
          })
        })
      })

      test('should return empty comments if an article is not have a comments', async () => {
        const response = await request(server)
          .get('/comments')
          .query({
            articleId: 2,
            limit: 10,
            orderBy: 'asc',
            parentCommentId: 1,
            sortBy: 'createdAt',
          })
          .set('Authorization', `Bearer ${accessToken}`)

        const items = response.body.items as Comment[]
        const { after, before } = response.body.meta as CursorPaginateMeta

        expect(response.status).toBe(200)
        expect(items.length).toBe(0)
        expect(after).toBeNull()
        expect(before).toBeNull()
      })
    })

    describe('user', () => {
      describe('1 page', () => {
        beforeEach(async () => await createComments(prismaClient, 10))
        afterEach(async () => await truncateComments(prismaClient))

        test('should return comments sorted by rating and ordered by DESC', async () => {
          const response = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const items = response.body.items as Comment[]
          const { after, before } = response.body.meta as CursorPaginateMeta

          expect(response.status).toBe(200)
          expect(items.length).toBe(10)
          expect(items[0].rating).toBe(9)
          expect(items[9].rating).toBe(0)
          expect(after).toBeNull()
          expect(before).toBeNull()
        })

        test('should return comments sorted by rating and ordered by ASC', async () => {
          const response = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const items = response.body.items as Comment[]
          const { after, before } = response.body.meta as CursorPaginateMeta

          expect(response.status).toBe(200)
          expect(items.length).toBe(10)
          expect(items[0].rating).toBe(0)
          expect(items[9].rating).toBe(9)
          expect(after).toBeNull()
          expect(before).toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by DESC', async () => {
          const response = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const items = response.body.items as Comment[]
          const { after, before } = response.body.meta as CursorPaginateMeta

          expect(response.status).toBe(200)
          expect(items.length).toBe(10)
          expect(items[0].createdAt).toBe(new Date(9).toISOString())
          expect(items[9].createdAt).toBe(new Date(0).toISOString())
          expect(after).toBeNull()
          expect(before).toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by ASC', async () => {
          const response = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const items = response.body.items as Comment[]
          const { after, before } = response.body.meta as CursorPaginateMeta

          expect(response.status).toBe(200)
          expect(items.length).toBe(10)
          expect(items[0].createdAt).toBe(new Date(0).toISOString())
          expect(items[9].createdAt).toBe(new Date(9).toISOString())
          expect(after).toBeNull()
          expect(before).toBeNull()
        })
      })

      describe('2 pages', () => {
        beforeEach(async () => await createComments(prismaClient, 20))
        afterEach(async () => await truncateComments(prismaClient))

        test('should return comments sorted by rating and ordered by DESC', async () => {
          const firstResponse = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseItems = firstResponse.body.items as Comment[]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponse.status).toBe(200)
          expect(firstResponseItems.length).toBe(10)
          expect(firstResponseItems[0].rating).toBe(19)
          expect(firstResponseItems[9].rating).toBe(10)
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).toBeNull()

          const secondResponse = await request(server)
            .get('/comments')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseItems = secondResponse.body.items as Comment[]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponse.status).toBe(200)
          expect(secondResponseItems.length).toBe(10)
          expect(secondResponseItems[0].rating).toBe(9)
          expect(secondResponseItems[9].rating).toBe(0)
          expect(secondResponseAfter).toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })

        test('should return comments sorted by rating and ordered by ASC', async () => {
          const firstResponse = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseItems = firstResponse.body.items as Comment[]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponse.status).toBe(200)
          expect(firstResponseItems.length).toBe(10)
          expect(firstResponseItems[0].rating).toBe(0)
          expect(firstResponseItems[9].rating).toBe(9)
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).toBeNull()

          const secondResponse = await request(server)
            .get('/comments')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseItems = secondResponse.body.items as Comment[]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponse.status).toBe(200)
          expect(secondResponseItems.length).toBe(10)
          expect(secondResponseItems[0].rating).toBe(10)
          expect(secondResponseItems[9].rating).toBe(19)
          expect(secondResponseAfter).toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by DESC', async () => {
          const firstResponse = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseItems = firstResponse.body.items as Comment[]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponse.status).toBe(200)
          expect(firstResponseItems.length).toBe(10)
          expect(firstResponseItems[0].createdAt).toBe(
            new Date(19).toISOString(),
          )
          expect(firstResponseItems[9].createdAt).toBe(
            new Date(10).toISOString(),
          )
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).toBeNull()

          const secondResponse = await request(server)
            .get('/comments')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseItems = secondResponse.body.items as Comment[]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponse.status).toBe(200)
          expect(secondResponseItems.length).toBe(10)
          expect(secondResponseItems[0].createdAt).toBe(
            new Date(9).toISOString(),
          )
          expect(secondResponseItems[9].createdAt).toBe(
            new Date(0).toISOString(),
          )
          expect(secondResponseAfter).toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by ASC', async () => {
          const firstResponse = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseItems = firstResponse.body.items as Comment[]
          const { after: firstResponseAfter, before: firstResponseBefore } =
            firstResponse.body.meta as CursorPaginateMeta

          expect(firstResponse.status).toBe(200)
          expect(firstResponseItems.length).toBe(10)
          expect(firstResponseItems[0].createdAt).toBe(
            new Date(0).toISOString(),
          )
          expect(firstResponseItems[9].createdAt).toBe(
            new Date(9).toISOString(),
          )
          expect(firstResponseAfter).not.toBeNull()
          expect(firstResponseBefore).toBeNull()

          const secondResponse = await request(server)
            .get('/comments')
            .query({
              after: firstResponseAfter,
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseItems = secondResponse.body.items as Comment[]
          const { after: secondResponseAfter, before: secondResponseBefore } =
            secondResponse.body.meta as CursorPaginateMeta

          expect(secondResponse.status).toBe(200)
          expect(secondResponseItems.length).toBe(10)
          expect(secondResponseItems[0].createdAt).toBe(
            new Date(10).toISOString(),
          )
          expect(secondResponseItems[9].createdAt).toBe(
            new Date(19).toISOString(),
          )
          expect(secondResponseAfter).toBeNull()
          expect(secondResponseBefore).not.toBeNull()
        })
      })

      test('should return empty comments if a user is not have a comments', async () => {
        const response = await request(server)
          .get('/comments')
          .query({
            authorId: 2,
            limit: 10,
            orderBy: 'asc',
            parentCommentId: 1,
            sortBy: 'createdAt',
          })
          .set('Authorization', `Bearer ${accessToken}`)

        const items = response.body.items as Comment[]
        const { after, before } = response.body.meta as CursorPaginateMeta

        expect(response.status).toBe(200)
        expect(items.length).toBe(0)
        expect(after).toBeNull()
        expect(before).toBeNull()
      })
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).get('/comments').expect(401)
    })
  })

  describe('PATCH /comments/1', () => {
    afterEach(async () => await truncateComments(prismaClient))

    test('should return a comment', async () => {
      await createComment(prismaClient)

      const body: UpdateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeBlockquoteNode()],
        },
      }

      const response = await request(server)
        .patch('/comments/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      const updatedComment = response.body as Comment

      expect(response.status).toBe(200)
      expect(updatedComment.content).toEqual(body.content)
    })

    test('should return 400 if a doc content field contains not allowed node', async () => {
      await createComment(prismaClient)

      const body: UpdateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      return request(server)
        .patch('/comments/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 401 if user is not authenticated', async () => {
      const body: UpdateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      return request(server).patch('/comments/1').send(body).expect(401)
    })
  })

  describe('DELETE /comments/1', () => {
    afterEach(async () => await truncateComments(prismaClient))

    test('should return a comment', async () => {
      const originalComment = await createComment(prismaClient)

      const response = await request(server)
        .delete('/comments/1')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(originalComment)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).delete('/comments/1').expect(401)
    })
  })
})
