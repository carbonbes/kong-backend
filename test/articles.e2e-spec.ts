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
    describe('201', () => {
      test('and return an article', async () => {
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
    })

    describe('400', () => {
      test('if body is empty', async () => {
        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({})
          .expect(400)
      })

      test('if body content is empty', async () => {
        const body: CreateArticleDto = {
          content: {},
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if DocNode type is invalid', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'ecreer',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: 'Test' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if DocNode content not provided', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if DocNode content is empty', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if DocNode content contains not allowed node', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [{ type: 'erfrfer' }],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if HeadingNode attributes not provided', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                content: [{ type: 'text', text: 'Test' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if HeadingNode level attribute not provided', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: {},
                content: [{ type: 'text', text: 'Test' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if HeadingNode level attribute is invalid', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 0 },
                content: [{ type: 'text', text: 'Test' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if HeadingNode content not provided', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if HeadingNode content is empty', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if HeadingNode content contains not allowed node', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'paragraph' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if HeadingNode content contains invalid node', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: '' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if ParagraphNode content not provided', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if ParagraphNode content is empty', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if ParagraphNode content contains not allowed node', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'ercdtgt' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if ParagraphNode content contains invalid node', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })

      test('if BlockquoteNode is invalid', async () => {
        const body: CreateArticleDto = {
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', value: 'Test' }],
              },
            ],
          },
        }

        return request(server)
          .post('/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(body)
          .expect(400)
      })
    })

    describe('401', () => {
      test('if user is not authenticated', async () => {
        return request(server).post('/articles').expect(401)
      })
    })
  })

  describe('GET /articles/1', () => {
    describe('200', () => {
      test('and return an article', async () => {
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
    })

    describe('401', () => {
      test('if user is not authenticated', async () => {
        return request(server).get('/articles/1').expect(401)
      })
    })
  })
})
