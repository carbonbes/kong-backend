import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { App } from 'supertest/types'
import { PrismaService } from '@/prisma/prisma.service'
import { execSync } from 'child_process'
import { CreateArticleDto } from '@/articles/dtos'
import { User } from '@/users/types'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { EncodedJwt } from '@/shared/types'
import { mock, MockProxy } from 'vitest-mock-extended'
import { MailService } from '@/mail/mail.service'

describe('ArticlesController (e2e)', () => {
  let app: INestApplication<App>
  let server: App
  let mailService: MockProxy<MailService>
  let prismaService: PrismaService
  let authJwtsService: AuthJwtsService
  let user: User
  let accessToken: EncodedJwt

  beforeAll(async () => {
    execSync('docker compose -f compose.e2e.yaml up -d')
    execSync('yarn prisma db push')
    execSync('yarn prisma generate')

    mailService = mock<MailService>()

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailService)
      .compile()

    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    server = app.getHttpServer()
    await app.init()

    prismaService = module.get<PrismaService>(PrismaService)
    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)

    user = await prismaService.user.create({
      data: { email: 'test@test.com', name: 'Test', gender: 'MALE' },
    })
    accessToken = authJwtsService.sign({ sub: user.email }).accessToken
  })

  afterAll(async () => {
    await app.close()
    execSync('docker compose -f compose.e2e.yaml down')
  })

  describe('POST /articles', () => {
    beforeEach(async () => {
      await prismaService.$executeRaw`TRUNCATE TABLE "Article" RESTART IDENTITY CASCADE;`
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
      const article = await prismaService.article.create({
        data: {
          authorId: 1,
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
        },
      })

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
