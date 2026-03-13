import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { App } from 'supertest/types'

describe('ArticlesController (e2e)', () => {
  let app: INestApplication<App>
  let server: App

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    server = app.getHttpServer()

    await app.init()
  })

  describe('GET /articles/1', () => {
    test('should be return an article', () => {
      return request(server)
        .get('/articles/1')
        .expect(200)
        .expect('Hello World!')
    })
  })
})
