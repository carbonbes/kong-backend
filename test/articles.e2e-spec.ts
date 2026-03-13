import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { App } from 'supertest/types'
import { PrismaService } from '@/prisma/prisma.service'
import { execSync } from 'child_process'

describe('ArticlesController (e2e)', () => {
  let app: INestApplication<App>
  let server: App
  let prismaService: PrismaService

  beforeAll(async () => {
    execSync('yarn prisma db push')
    execSync('yarn prisma generate')

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    prismaService = module.get<PrismaService>(PrismaService)

    app = module.createNestApplication()
    server = app.getHttpServer()

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /articles/1', () => {
    beforeEach(async () => {
      await prismaService.user.deleteMany()
    })

    test('should be return an article', async () => {
      await prismaService.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test',
          gender: 'MALE',
          articles: {
            create: {
              content: [
                {
                  type: 'heading',
                  attrs: { level: 1 },
                  content: [{ type: 'text', text: 'Тест' }],
                },
              ],
            },
          },
        },
      })

      return request(server)
        .get('/articles/1')
        .expect(200)
        .expect({
          id: 1,
          authorId: 1,
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Тест' }],
            },
          ],
          status: 'DRAFT',
        })
    })
  })
})
