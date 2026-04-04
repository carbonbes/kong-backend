import { Test, TestingModule } from '@nestjs/testing'
import { SubsitesService } from './subsites.service'

describe('SubsitesService', () => {
  let service: SubsitesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubsitesService],
    }).compile()

    service = module.get<SubsitesService>(SubsitesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
