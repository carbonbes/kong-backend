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
import { CursorPaginationMeta } from 'prisma-extension-pagination'
import { FindManyWithCursorPaginationMeta } from '@/shared/prisma/entity/types'
import { createComment, createComments, truncateComments } from './utils'

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

      const result = await request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(201)
      expect(result.body.parentCommentId).toBeNull()
      expect(result.body.content).toEqual(body.content)
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

      const result = await request(server)
        .post('/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(201)
      expect(result.body.parentCommentId).toBe(1)
      expect(result.body.content).toEqual(body.content)
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
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { previousCursor, nextCursor } = result.body
              .meta as FindManyWithCursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(firstComment.rating).toBe(9)
            expect(lastComment.rating).toBe(0)
            expect(previousCursor).toBeNull()
            expect(nextCursor).toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { hasPreviousPage, hasNextPage } = result.body
              .meta as CursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(firstComment.rating).toBe(0)
            expect(lastComment.rating).toBe(9)
            expect(hasPreviousPage).toBeFalsy()
            expect(hasNextPage).toBeFalsy()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { hasPreviousPage, hasNextPage } = result.body
              .meta as CursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(firstComment.createdAt).toBe(9)
            expect(lastComment.createdAt).toBe(0)
            expect(hasPreviousPage).toBeFalsy()
            expect(hasNextPage).toBeFalsy()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { hasPreviousPage, hasNextPage } = result.body
              .meta as CursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === null))
            expect(firstComment.createdAt).toBe(0)
            expect(lastComment.createdAt).toBe(9)
            expect(hasPreviousPage).toBeFalsy()
            expect(hasNextPage).toBeFalsy()
          })
        })

        describe('2 pages', () => {
          beforeEach(async () => await createComments(prismaClient, 20))
          afterEach(async () => await truncateComments(prismaClient))

          test('should return comments sorted by rating and ordered by DESC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(firstResponseFirstComment.rating).toBe(19)
            expect(firstResponseLastComment.rating).toBe(10)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'desc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(secondResponseFirstComment.rating).toBe(9)
            expect(secondResponseLastComment.rating).toBe(0)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(firstResponseFirstComment.rating).toBe(0)
            expect(firstResponseLastComment.rating).toBe(9)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'asc',
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(secondResponseFirstComment.rating).toBe(10)
            expect(secondResponseLastComment.rating).toBe(19)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(firstResponseFirstComment.createdAt).toBe(19)
            expect(firstResponseLastComment.createdAt).toBe(10)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'desc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(secondResponseFirstComment.createdAt).toBe(9)
            expect(secondResponseLastComment.createdAt).toBe(0)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(firstResponseFirstComment.createdAt).toBe(0)
            expect(firstResponseLastComment.createdAt).toBe(9)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'asc',
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === null),
            )
            expect(secondResponseFirstComment.createdAt).toBe(10)
            expect(secondResponseLastComment.createdAt).toBe(19)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
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
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { previousCursor, nextCursor } = result.body
              .meta as FindManyWithCursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === 1))
            expect(firstComment.rating).toBe(9)
            expect(lastComment.rating).toBe(0)
            expect(previousCursor).toBeNull()
            expect(nextCursor).toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { previousCursor, nextCursor } = result.body
              .meta as FindManyWithCursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === 1))
            expect(firstComment.rating).toBe(0)
            expect(lastComment.rating).toBe(9)
            expect(previousCursor).toBeNull()
            expect(nextCursor).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { previousCursor, nextCursor } = result.body
              .meta as FindManyWithCursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === 1))
            expect(firstComment.createdAt).toBe(9)
            expect(lastComment.createdAt).toBe(0)
            expect(previousCursor).toBeNull()
            expect(nextCursor).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const result = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const status = result.status
            const items: Comment[] = result.body.items
            const commentsCount = items.length
            const firstComment = items[0]
            const lastComment = items[9]
            const { previousCursor, nextCursor } = result.body
              .meta as FindManyWithCursorPaginationMeta

            expect(status).toBe(200)
            expect(commentsCount).toBe(10)
            items.forEach((item) => expect(item.parentCommentId === 1))
            expect(firstComment.createdAt).toBe(0)
            expect(lastComment.createdAt).toBe(9)
            expect(previousCursor).toBeNull()
            expect(nextCursor).toBeNull()
          })
        })

        describe('2 pages', () => {
          beforeEach(async () => {
            await createComment(prismaClient)
            await createComments(prismaClient, 20, 1)
          })

          afterEach(async () => await truncateComments(prismaClient))

          test('should return comments sorted by rating and ordered by DESC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(firstResponseFirstComment.rating).toBe(19)
            expect(firstResponseLastComment.rating).toBe(10)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(secondResponseFirstComment.rating).toBe(9)
            expect(secondResponseLastComment.rating).toBe(0)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
          })

          test('should return comments sorted by rating and ordered by ASC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(firstResponseFirstComment.rating).toBe(0)
            expect(firstResponseLastComment.rating).toBe(9)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'rating',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(secondResponseFirstComment.rating).toBe(10)
            expect(secondResponseLastComment.rating).toBe(19)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by DESC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(firstResponseFirstComment.createdAt).toBe(19)
            expect(firstResponseLastComment.createdAt).toBe(10)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'desc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(secondResponseFirstComment.createdAt).toBe(9)
            expect(secondResponseLastComment.createdAt).toBe(0)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
          })

          test('should return comments sorted by createdAt and ordered by ASC', async () => {
            const result1 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const firstResponseStatus = result1.status
            const firstResponseItems: Comment[] = result1.body.items
            const firstResponseCommentsCount = firstResponseItems.length
            const firstResponseFirstComment = firstResponseItems[0]
            const firstResponseLastComment = firstResponseItems[9]
            const {
              previousCursor: firstResponsePreviousCursor,
              nextCursor: firstResponseNextCursor,
            } = result1.body.meta as FindManyWithCursorPaginationMeta

            expect(firstResponseStatus).toBe(200)
            expect(firstResponseCommentsCount).toBe(10)
            firstResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(firstResponseFirstComment.createdAt).toBe(0)
            expect(firstResponseLastComment.createdAt).toBe(9)
            expect(firstResponsePreviousCursor).toBeNull()
            expect(firstResponseNextCursor).not.toBeNull()

            const result2 = await request(server)
              .get('/comments')
              .query({
                articleId: 1,
                limit: 10,
                nextCursor: firstResponseNextCursor,
                orderBy: 'asc',
                parentCommentId: 1,
                sortBy: 'createdAt',
              })
              .set('Authorization', `Bearer ${accessToken}`)

            const secondResponseStatus = result2.status
            const secondResponseItems: Comment[] = result2.body.items
            const secondResponseCommentsCount = secondResponseItems.length
            const secondResponseFirstComment = secondResponseItems[0]
            const secondResponseLastComment = secondResponseItems[9]
            const {
              previousCursor: secondResponsePreviousCursor,
              nextCursor: secondResponseNextCursor,
            } = result2.body.meta as FindManyWithCursorPaginationMeta

            expect(secondResponseStatus).toBe(200)
            expect(secondResponseCommentsCount).toBe(10)
            secondResponseItems.forEach((item) =>
              expect(item.parentCommentId === 1),
            )
            expect(secondResponseFirstComment.createdAt).toBe(10)
            expect(secondResponseLastComment.createdAt).toBe(19)
            expect(secondResponsePreviousCursor).not.toBeNull()
            expect(secondResponseNextCursor).toBeNull()
          })
        })
      })

      test('should return empty comments if an article is not have a comments', async () => {
        const result = await request(server)
          .get('/comments')
          .query({
            articleId: 2,
            limit: 10,
            orderBy: 'asc',
            parentCommentId: 1,
            sortBy: 'createdAt',
          })
          .set('Authorization', `Bearer ${accessToken}`)

        const status = result.status
        const items: Comment[] = result.body.items
        const commentsCount = items.length
        const { previousCursor, nextCursor } = result.body
          .meta as FindManyWithCursorPaginationMeta

        expect(status).toBe(200)
        expect(commentsCount).toBe(0)
        expect(previousCursor).toBeNull()
        expect(nextCursor).toBeNull()
      })
    })

    describe('user', () => {
      describe('1 page', () => {
        beforeEach(async () => await createComments(prismaClient, 10))
        afterEach(async () => await truncateComments(prismaClient))

        test('should return comments sorted by rating and ordered by DESC', async () => {
          const result = await request(server)
            .get('/comments')
            .query({
              articleId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Comment[] = result.body.items
          const commentsCount = items.length
          const firstComment = items[0]
          const lastComment = items[9]
          const { previousCursor, nextCursor } = result.body
            .meta as FindManyWithCursorPaginationMeta

          expect(status).toBe(200)
          expect(commentsCount).toBe(10)
          expect(firstComment.rating).toBe(9)
          expect(lastComment.rating).toBe(0)
          expect(previousCursor).toBeNull()
          expect(nextCursor).toBeNull()
        })

        test('should return comments sorted by rating and ordered by ASC', async () => {
          const result = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Comment[] = result.body.items
          const commentsCount = items.length
          const firstComment = items[0]
          const lastComment = items[9]
          const { previousCursor, nextCursor } = result.body
            .meta as FindManyWithCursorPaginationMeta

          expect(status).toBe(200)
          expect(commentsCount).toBe(10)
          expect(firstComment.rating).toBe(0)
          expect(lastComment.rating).toBe(9)
          expect(previousCursor).toBeNull()
          expect(nextCursor).toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by DESC', async () => {
          const result = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Comment[] = result.body.items
          const commentsCount = items.length
          const firstComment = items[0]
          const lastComment = items[9]
          const { previousCursor, nextCursor } = result.body
            .meta as FindManyWithCursorPaginationMeta

          expect(status).toBe(200)
          expect(commentsCount).toBe(10)
          expect(firstComment.createdAt).toBe(9)
          expect(lastComment.createdAt).toBe(0)
          expect(previousCursor).toBeNull()
          expect(nextCursor).toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by ASC', async () => {
          const result = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const status = result.status
          const items: Comment[] = result.body.items
          const commentsCount = items.length
          const firstComment = items[0]
          const lastComment = items[9]
          const { previousCursor, nextCursor } = result.body
            .meta as FindManyWithCursorPaginationMeta

          expect(status).toBe(200)
          expect(commentsCount).toBe(10)
          expect(firstComment.createdAt).toBe(0)
          expect(lastComment.createdAt).toBe(9)
          expect(previousCursor).toBeNull()
          expect(nextCursor).toBeNull()
        })
      })

      describe('2 pages', () => {
        beforeEach(async () => await createComments(prismaClient, 20))
        afterEach(async () => await truncateComments(prismaClient))

        test('should return comments sorted by rating and ordered by DESC', async () => {
          const result1 = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = result1.status
          const firstResponseItems: Comment[] = result1.body.items
          const firstResponseCommentsCount = firstResponseItems.length
          const firstResponseFirstComment = firstResponseItems[0]
          const firstResponseLastComment = firstResponseItems[9]
          const {
            previousCursor: firstResponsePreviousCursor,
            nextCursor: firstResponseNextCursor,
          } = result1.body.meta as FindManyWithCursorPaginationMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseCommentsCount).toBe(10)
          expect(firstResponseFirstComment.rating).toBe(19)
          expect(firstResponseLastComment.rating).toBe(10)
          expect(firstResponsePreviousCursor).toBeNull()
          expect(firstResponseNextCursor).not.toBeNull()

          const result2 = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              nextCursor: firstResponseNextCursor,
              orderBy: 'desc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = result2.status
          const secondResponseItems: Comment[] = result2.body.items
          const secondResponseCommentsCount = secondResponseItems.length
          const secondResponseFirstComment = secondResponseItems[0]
          const secondResponseLastComment = secondResponseItems[9]
          const {
            previousCursor: secondResponsePreviousCursor,
            nextCursor: secondResponseNextCursor,
          } = result2.body.meta as FindManyWithCursorPaginationMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseCommentsCount).toBe(10)
          expect(secondResponseFirstComment.rating).toBe(9)
          expect(secondResponseLastComment.rating).toBe(0)
          expect(secondResponsePreviousCursor).not.toBeNull()
          expect(secondResponseNextCursor).toBeNull()
        })

        test('should return comments sorted by rating and ordered by ASC', async () => {
          const result1 = await request(server)
            .get('/comments')
            .query({ authorId: 1, limit: 10, orderBy: 'asc', sortBy: 'rating' })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = result1.status
          const firstResponseItems: Comment[] = result1.body.items
          const firstResponseCommentsCount = firstResponseItems.length
          const firstResponseFirstComment = firstResponseItems[0]
          const firstResponseLastComment = firstResponseItems[9]
          const {
            previousCursor: firstResponsePreviousCursor,
            nextCursor: firstResponseNextCursor,
          } = result1.body.meta as FindManyWithCursorPaginationMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseCommentsCount).toBe(10)
          expect(firstResponseFirstComment.rating).toBe(0)
          expect(firstResponseLastComment.rating).toBe(9)
          expect(firstResponsePreviousCursor).toBeNull()
          expect(firstResponseNextCursor).not.toBeNull()

          const result2 = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              nextCursor: firstResponseNextCursor,
              orderBy: 'asc',
              sortBy: 'rating',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = result2.status
          const secondResponseItems: Comment[] = result2.body.items
          const secondResponseCommentsCount = secondResponseItems.length
          const secondResponseFirstComment = secondResponseItems[0]
          const secondResponseLastComment = secondResponseItems[9]
          const {
            previousCursor: secondResponsePreviousCursor,
            nextCursor: secondResponseNextCursor,
          } = result2.body.meta as FindManyWithCursorPaginationMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseCommentsCount).toBe(10)
          expect(secondResponseFirstComment.rating).toBe(10)
          expect(secondResponseLastComment.rating).toBe(19)
          expect(secondResponsePreviousCursor).not.toBeNull()
          expect(secondResponseNextCursor).toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by DESC', async () => {
          const result1 = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = result1.status
          const firstResponseItems: Comment[] = result1.body.items
          const firstResponseCommentsCount = firstResponseItems.length
          const firstResponseFirstComment = firstResponseItems[0]
          const firstResponseLastComment = firstResponseItems[9]
          const {
            previousCursor: firstResponsePreviousCursor,
            nextCursor: firstResponseNextCursor,
          } = result1.body.meta as FindManyWithCursorPaginationMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseCommentsCount).toBe(10)
          expect(firstResponseFirstComment.createdAt).toBe(19)
          expect(firstResponseLastComment.createdAt).toBe(10)
          expect(firstResponsePreviousCursor).toBeNull()
          expect(firstResponseNextCursor).not.toBeNull()

          const result2 = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              nextCursor: firstResponseNextCursor,
              orderBy: 'desc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = result2.status
          const secondResponseItems: Comment[] = result2.body.items
          const secondResponseCommentsCount = secondResponseItems.length
          const secondResponseFirstComment = secondResponseItems[0]
          const secondResponseLastComment = secondResponseItems[9]
          const {
            previousCursor: secondResponsePreviousCursor,
            nextCursor: secondResponseNextCursor,
          } = result2.body.meta as FindManyWithCursorPaginationMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseCommentsCount).toBe(10)
          expect(secondResponseFirstComment.createdAt).toBe(9)
          expect(secondResponseLastComment.createdAt).toBe(0)
          expect(secondResponsePreviousCursor).not.toBeNull()
          expect(secondResponseNextCursor).toBeNull()
        })

        test('should return comments sorted by createdAt and ordered by ASC', async () => {
          const result1 = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const firstResponseStatus = result1.status
          const firstResponseItems: Comment[] = result1.body.items
          const firstResponseCommentsCount = firstResponseItems.length
          const firstResponseFirstComment = firstResponseItems[0]
          const firstResponseLastComment = firstResponseItems[9]
          const {
            previousCursor: firstResponsePreviousCursor,
            nextCursor: firstResponseNextCursor,
          } = result1.body.meta as FindManyWithCursorPaginationMeta

          expect(firstResponseStatus).toBe(200)
          expect(firstResponseCommentsCount).toBe(10)
          expect(firstResponseFirstComment.createdAt).toBe(0)
          expect(firstResponseLastComment.createdAt).toBe(9)
          expect(firstResponsePreviousCursor).toBeNull()
          expect(firstResponseNextCursor).not.toBeNull()

          const result2 = await request(server)
            .get('/comments')
            .query({
              authorId: 1,
              limit: 10,
              nextCursor: firstResponseNextCursor,
              orderBy: 'asc',
              sortBy: 'createdAt',
            })
            .set('Authorization', `Bearer ${accessToken}`)

          const secondResponseStatus = result2.status
          const secondResponseItems: Comment[] = result2.body.items
          const secondResponseCommentsCount = secondResponseItems.length
          const secondResponseFirstComment = secondResponseItems[0]
          const secondResponseLastComment = secondResponseItems[9]
          const {
            previousCursor: secondResponsePreviousCursor,
            nextCursor: secondResponseNextCursor,
          } = result2.body.meta as FindManyWithCursorPaginationMeta

          expect(secondResponseStatus).toBe(200)
          expect(secondResponseCommentsCount).toBe(10)
          expect(secondResponseFirstComment.createdAt).toBe(10)
          expect(secondResponseLastComment.createdAt).toBe(19)
          expect(secondResponsePreviousCursor).not.toBeNull()
          expect(secondResponseNextCursor).toBeNull()
        })
      })

      test('should return empty comments if a user is not have a comments', async () => {
        const result = await request(server)
          .get('/comments')
          .query({
            authorId: 2,
            limit: 10,
            orderBy: 'asc',
            parentCommentId: 1,
            sortBy: 'createdAt',
          })
          .set('Authorization', `Bearer ${accessToken}`)

        const status = result.status
        const items: Comment[] = result.body.items
        const commentsCount = items.length
        const { previousCursor, nextCursor } = result.body
          .meta as FindManyWithCursorPaginationMeta

        expect(status).toBe(200)
        expect(commentsCount).toBe(0)
        expect(previousCursor).toBeNull()
        expect(nextCursor).toBeNull()
      })
    })

    test('should return 401 if user is not authenticated', async () =>
      request(server).get('/comments').expect(401))
  })

  describe('PATCH /comments/1', () => {
    afterEach(async () => await truncateComments(prismaClient))

    test('should return a comment', async () => {
      const originalComment = await createComment(prismaClient)

      const body: UpdateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeBlockquoteNode()],
        },
      }

      const updatedComment = { ...originalComment, ...body }

      const result = await request(server)
        .patch('/comments/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(200)
      expect(result.body.content).toEqual(updatedComment.content)
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
      await createComment(prismaClient)

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
      const deletedComment = await createComment(prismaClient)

      const result = await request(server)
        .delete('/comments/1')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(result.status).toBe(200)
      expect(result.body).toEqual(deletedComment)
    })

    test('should return 401 if user is not authenticated', async () => {
      return request(server).delete('/comments/1').expect(401)
    })
  })
})
