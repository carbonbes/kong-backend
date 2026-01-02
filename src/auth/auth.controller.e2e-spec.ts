import { afterEach, beforeEach, describe, test } from 'vitest'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import * as request from 'supertest'

describe('AuthController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  test('/signup POST', () => {
    return request(app.getHttpServer()).post('/signup').expect(200)
  })
})
