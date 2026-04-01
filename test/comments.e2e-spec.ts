import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { App } from 'supertest/types'
import { mock, MockProxy } from 'vitest-mock-extended'
import { MailService } from '@/mail/mail.service'
import { DataSource, Repository } from 'typeorm'
import { UsersService } from '@/users/users.service'
import { ArticlesService } from '@/articles/articles.service'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { User } from '@/users/entities'
import { EncodedJwt } from '@/shared/types'
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { TestTypeOrmModule } from './modules'
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm'
import { UserGender } from '@/users/enums'
import { getFakeHeadingNode, getFakeParagraphNode } from '@/test/utils'
import { CreateCommentDto, UpdateCommentDto } from '@/comments/dtos'
import request from 'supertest'
import { Comment } from '@/comments/entities'

describe('Comments (e2e)', () => {
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
    await articlesService.create({
      authorId: 1,
      content: [getFakeHeadingNode()],
    })
  }, 60000)

  afterAll(async () => {
    await app.close()
    await postgresContainer.stop()
    await redisContainer.stop()
  })

  describe('POST /comments/articles/1', () => {
    afterEach(
      async () =>
        await dataSource.query(
          'TRUNCATE TABLE comments RESTART IDENTITY CASCADE',
        ),
    )

    test('should return 201 and root comment', async () => {
      const body: CreateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      const result = await request(server)
        .post('/comments/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(201)
      expect(result.body.parentCommentId).toBeNull()
      expect(result.body.content).toEqual(body.content)
    })

    test('should return 201 and child comment', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      const body: CreateCommentDto = {
        parentCommentId: 1,
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      const result = await request(server)
        .post('/comments/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      expect(result.status).toBe(201)
      expect(result.body.parentCommentId).toBe(1)
      expect(result.body.content).toEqual(body.content)
    })

    test('should return 400 if a doc content field contains not allowed node', async () => {
      const body: CreateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      return request(server)
        .post('/comments/articles/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400)
    })

    test('should return 401 if user is not authenticated', async () => {
      const body: CreateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeHeadingNode()],
        },
      }

      return request(server).post('/comments/articles/1').send(body).expect(401)
    })
  })

  describe('GET /comments/articles/1', () => {
    afterEach(
      async () =>
        await dataSource.query(
          'TRUNCATE TABLE comments RESTART IDENTITY CASCADE',
        ),
    )

    test('should return 200 and a single page of root comments sort by rating and order by DESC', async () => {
      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === null))
      expect(firstComment.rating).toBe(9)
      expect(lastComment.rating).toBe(0)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of root comments sort by rating and order by ASC', async () => {
      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === null))
      expect(firstComment.rating).toBe(0)
      expect(lastComment.rating).toBe(9)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of root comments sort by createdAt and order by DESC', async () => {
      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          createdAt: i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === null))
      expect(firstComment.createdAt).toBe(9)
      expect(lastComment.createdAt).toBe(0)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of root comments sort by createdAt and order by ASC', async () => {
      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          createdAt: i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === null))
      expect(firstComment.createdAt).toBe(0)
      expect(lastComment.createdAt).toBe(9)
      expect(cursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of root comments sort by rating and order by DESC', async () => {
      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({ limit: 10, orderBy: 'DESC', sortBy: 'rating' })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(firstResponseFirstComment.rating).toBe(19)
      expect(firstResponseLastComment.rating).toBe(10)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({ cursor: firstResponseCursor })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(secondResponseFirstComment.rating).toBe(9)
      expect(secondResponseLastComment.rating).toBe(0)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of root comments sort by rating and order by ASC', async () => {
      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({ limit: 10, orderBy: 'ASC', sortBy: 'rating' })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(firstResponseFirstComment.rating).toBe(0)
      expect(firstResponseLastComment.rating).toBe(9)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({ cursor: firstResponseCursor, orderBy: 'ASC' })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(secondResponseFirstComment.rating).toBe(10)
      expect(secondResponseLastComment.rating).toBe(19)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of root comments sort by createdAt and order by DESC', async () => {
      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          createdAt: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({ limit: 10, orderBy: 'DESC', sortBy: 'createdAt' })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(firstResponseFirstComment.createdAt).toBe(19)
      expect(firstResponseLastComment.createdAt).toBe(10)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({
          cursor: firstResponseCursor,
          orderBy: 'DESC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(secondResponseFirstComment.createdAt).toBe(9)
      expect(secondResponseLastComment.createdAt).toBe(0)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of root comments sort by createdAt and order by ASC', async () => {
      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          createdAt: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({ limit: 10, orderBy: 'ASC', sortBy: 'createdAt' })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(firstResponseFirstComment.createdAt).toBe(0)
      expect(firstResponseLastComment.createdAt).toBe(9)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({
          cursor: firstResponseCursor,
          orderBy: 'ASC',
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) =>
        expect(item.parentCommentId === null),
      )
      expect(secondResponseFirstComment.createdAt).toBe(10)
      expect(secondResponseLastComment.createdAt).toBe(19)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and a single page of child comments sort by rating and order by DESC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          parentCommentId: 1,
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstComment.rating).toBe(9)
      expect(lastComment.rating).toBe(0)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of child comments sort by rating and order by ASC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          rating: i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          parentCommentId: 1,
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstComment.rating).toBe(0)
      expect(lastComment.rating).toBe(9)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of child comments sort by createdAt and order by DESC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          createdAt: 0 + i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          parentCommentId: 1,
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstComment.createdAt).toBe(9)
      expect(lastComment.createdAt).toBe(0)
      expect(cursor).toBeNull()
    })

    test('should return 200 and a single page of child comments sort by createdAt and order by ASC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 10 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          createdAt: 0 + i,
        })),
      )

      const result = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          parentCommentId: 1,
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const status = result.status
      const items: Comment[] = result.body.items
      const commentsCount = items.length
      const firstComment = items[0]
      const lastComment = items[9]
      const cursor: null = result.body.meta.cursor

      expect(status).toBe(200)
      expect(commentsCount).toBe(10)
      items.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstComment.createdAt).toBe(0)
      expect(lastComment.createdAt).toBe(9)
      expect(cursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of child comments sort by rating and order by DESC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          parentCommentId: 1,
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstResponseFirstComment.rating).toBe(19)
      expect(firstResponseLastComment.rating).toBe(10)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'DESC',
          parentCommentId: 1,
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(secondResponseFirstComment.rating).toBe(9)
      expect(secondResponseLastComment.rating).toBe(0)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of child comments sort by rating and order by ASC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          rating: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          parentCommentId: 1,
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstResponseFirstComment.rating).toBe(0)
      expect(firstResponseLastComment.rating).toBe(9)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'ASC',
          parentCommentId: 1,
          sortBy: 'rating',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(secondResponseFirstComment.rating).toBe(10)
      expect(secondResponseLastComment.rating).toBe(19)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of child comments sort by createdAt and order by DESC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          createdAt: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'DESC',
          parentCommentId: 1,
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstResponseFirstComment.createdAt).toBe(19)
      expect(firstResponseLastComment.createdAt).toBe(10)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'DESC',
          parentCommentId: 1,
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(secondResponseFirstComment.createdAt).toBe(9)
      expect(secondResponseLastComment.createdAt).toBe(0)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 200 and the only 2 pages of child comments sort by createdAt and order by ASC', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      await commentsRepository.save(
        Array.from({ length: 20 }).map((_, i) => ({
          authorId: 1,
          articleId: 1,
          content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
          parentCommentId: 1,
          createdAt: i,
        })),
      )

      const result1 = await request(server)
        .get('/comments/articles/1')
        .query({
          limit: 10,
          orderBy: 'ASC',
          parentCommentId: 1,
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const firstResponseStatus = result1.status
      const firstResponseItems: Comment[] = result1.body.items
      const firstResponseCommentsCount = firstResponseItems.length
      const firstResponseFirstComment = firstResponseItems[0]
      const firstResponseLastComment = firstResponseItems[9]
      const firstResponseCursor: string = result1.body.meta.cursor

      expect(firstResponseStatus).toBe(200)
      expect(firstResponseCommentsCount).toBe(10)
      firstResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(firstResponseFirstComment.createdAt).toBe(0)
      expect(firstResponseLastComment.createdAt).toBe(9)
      expect(firstResponseCursor).not.toBeNull()

      const result2 = await request(server)
        .get('/comments/articles/1')
        .query({
          cursor: firstResponseCursor,
          limit: 10,
          orderBy: 'ASC',
          parentCommentId: 1,
          sortBy: 'createdAt',
        })
        .set('Authorization', `Bearer ${accessToken}`)

      const secondResponseStatus = result2.status
      const secondResponseItems: Comment[] = result2.body.items
      const secondResponseCommentsCount = secondResponseItems.length
      const secondResponseFirstComment = secondResponseItems[0]
      const secondResponseLastComment = secondResponseItems[9]
      const secondResponseCursor: null = result2.body.meta.cursor

      expect(secondResponseStatus).toBe(200)
      expect(secondResponseCommentsCount).toBe(10)
      secondResponseItems.forEach((item) => expect(item.parentCommentId === 1))
      expect(secondResponseFirstComment.createdAt).toBe(10)
      expect(secondResponseLastComment.createdAt).toBe(19)
      expect(secondResponseCursor).toBeNull()
    })

    test('should return 401 if user is not authenticated', async () =>
      request(server).get('/comments/articles/1').expect(401))
  })

  describe('PATCH /comments/1', () => {
    afterEach(
      async () =>
        await dataSource.query(
          'TRUNCATE TABLE comments RESTART IDENTITY CASCADE',
        ),
    )

    test('should return 200 and comment', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      const comment = (await commentsRepository.findOneBy({ id: 1 }))!

      const body: UpdateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      const result = await request(server)
        .patch('/comments/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(body)

      console.log(result.body)

      expect(result.status).toBe(200)
      expect(result.body).toEqual({ ...comment, ...body })
    })

    test('should return 401 if user is not authenticated', async () => {
      await commentsRepository.save({
        authorId: 1,
        articleId: 1,
        content: [{ type: 'doc', content: [getFakeParagraphNode()] }],
      })

      const body: UpdateCommentDto = {
        content: {
          type: 'doc',
          content: [getFakeParagraphNode()],
        },
      }

      return request(server).patch('/comments/1').send(body).expect(401)
    })
  })
})
