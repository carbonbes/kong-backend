import { Test, TestingModule } from '@nestjs/testing'
import { CommentsController } from './comments.controller'
import { CommentsService } from '@/comments/comments.service'
import { mock, MockProxy } from 'vitest-mock-extended'

describe('CommentsController', () => {
  let commentsController: CommentsController
  let commentsService: MockProxy<CommentsService>

  beforeEach(async () => {
    commentsService = mock<CommentsService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CommentsService, useValue: commentsService }],
      controllers: [CommentsController],
    }).compile()

    commentsController = module.get<CommentsController>(CommentsController)
  })

  describe('create', () => {})
})
