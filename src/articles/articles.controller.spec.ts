import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from '@/articles/articles.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeArticle } from '@/test/utils'

describe('ArticlesController', () => {
  let articlesController: ArticlesController
  let articlesService: MockProxy<ArticlesService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
    })
      .useMocker(mock)
      .compile()

    articlesController = module.get<ArticlesController>(ArticlesController)
    articlesService = module.get<MockProxy<ArticlesService>>(ArticlesService)
  })

  describe('create', () => {
    it('should be create an article', () => {
      const {  } = getFakeArticle()
    })
  })
})
