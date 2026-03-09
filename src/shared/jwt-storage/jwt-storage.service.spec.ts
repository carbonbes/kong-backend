import { JwtStorageService as AbstractJwtStorageService } from './jwt-storage.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { EntityId, Repository } from 'redis-om'
import { AddOptions, StoragedJwt } from './types'
import { createMockRedisSearch } from '@/test/mocks'
import { getFakeEmail, getFakeJwt, getFakeUuid } from '@/test/utils'
import { Test, TestingModule } from '@nestjs/testing'
import { getRedisOmRepositoryToken } from '@/redis-om/utils'
import { createSchema } from '@/shared/jwt-storage/utils'
import { getDecodedJwt } from '@/shared/utils'
import { StoragedJwtSchema } from '@/shared/jwt-storage/types'

class JwtStorageService extends AbstractJwtStorageService {
  constructor(repository: Repository<StoragedJwt>) {
    super(repository)
  }
}

const testJwtSchema = createSchema('test-jwt')

describe('JwtStorageService', () => {
  let jwtStorageService: JwtStorageService
  let repository: MockProxy<Repository<StoragedJwtSchema>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRedisOmRepositoryToken(testJwtSchema),
          useValue: mock<Repository<StoragedJwtSchema>>(),
        },
        {
          provide: JwtStorageService,
          useFactory: (repository: Repository<StoragedJwtSchema>) =>
            new JwtStorageService(repository),
          inject: [getRedisOmRepositoryToken(testJwtSchema)],
        },
      ],
    }).compile()

    jwtStorageService = module.get<JwtStorageService>(JwtStorageService)
    repository = module.get<MockProxy<Repository<StoragedJwtSchema>>>(
      getRedisOmRepositoryToken(testJwtSchema),
    )

    vi.clearAllMocks()
  })

  describe('add', () => {
    test('should be add a JWT', async () => {
      const { jti, sub, exp }: AddOptions = getDecodedJwt(getFakeJwt())

      const jwt: StoragedJwtSchema = { jti, sub }
      const jwtId = jwt[EntityId]
      const jwtExpirationDate = new Date(exp * 1000)

      repository.save.mockResolvedValue(jwt)

      const result = await jwtStorageService.add({ jti, sub, exp })

      expect(result).toEqual(jwt)
      expect(repository.save).toHaveBeenCalledWith({ jti, sub })
      expect(repository.expireAt).toHaveBeenCalledWith(jwtId, jwtExpirationDate)
    })
  })

  describe('getOne', () => {
    test('should be return a JWT by jti', async () => {
      const jwt = getDecodedJwt(getFakeJwt())

      const searchBuilder = createMockRedisSearch<StoragedJwt>({
        returnFirstValue: jwt,
      })
      repository.search.mockReturnValue(searchBuilder)

      const result = await jwtStorageService.getOne({ jti: jwt.jti })

      expect(result).toEqual(jwt)
      expect(repository.search).toHaveBeenCalled()
      expect(searchBuilder.where).toHaveBeenCalledWith('jti')
      expect(searchBuilder.eq).toHaveBeenCalledWith(jwt.jti)
      expect(searchBuilder.returnFirst).toHaveBeenCalled()
    })

    test('should be return null when JWT not found', async () => {
      const jti = getFakeUuid()

      const searchBuilder = createMockRedisSearch<StoragedJwt>({
        returnFirstValue: null,
      })
      repository.search.mockReturnValue(searchBuilder)

      const result = await jwtStorageService.getOne({ jti })

      expect(result).toBeNull()
      expect(repository.search).toHaveBeenCalled()
    })
  })

  describe('getAll', () => {
    test('should be return all JWTs for a user', async () => {
      const sub = getFakeEmail()

      const storagedJwts: StoragedJwt[] = Array(4).map(() =>
        getDecodedJwt(getFakeJwt({ payload: { sub } })),
      )

      const searchBuilder = createMockRedisSearch<StoragedJwt>({
        returnAllValue: storagedJwts,
      })
      repository.search.mockReturnValue(searchBuilder)

      const result = await jwtStorageService.getAll({ sub })

      expect(result).toEqual(storagedJwts)
      expect(repository.search).toHaveBeenCalled()
      expect(searchBuilder.where).toHaveBeenCalledWith('sub')
      expect(searchBuilder.eq).toHaveBeenCalledWith(sub)
      expect(searchBuilder.returnAll).toHaveBeenCalled()
    })

    test('should be return empty array when no JWTs found', async () => {
      const sub = getFakeEmail()

      const searchBuilder = createMockRedisSearch<StoragedJwt>({
        returnAllValue: [],
      })
      repository.search.mockReturnValue(searchBuilder)

      const result = await jwtStorageService.getAll({ sub })

      expect(result).toEqual([])
      expect(repository.search).toHaveBeenCalled()
    })
  })

  describe('has', () => {
    test('should be return true when JWT exists', async () => {
      const jwt = getDecodedJwt(getFakeJwt())

      const searchBuilder = createMockRedisSearch<StoragedJwt>({
        returnFirstValue: jwt,
      })
      repository.search.mockReturnValue(searchBuilder)

      const result = await jwtStorageService.has({ jti: jwt.jti })

      expect(result).toBe(true)
    })

    test('should be return false when JWT does not exist', async () => {
      const jti = getFakeUuid()

      const searchBuilder = createMockRedisSearch<StoragedJwt>({
        returnFirstValue: null,
      })
      repository.search.mockReturnValue(searchBuilder)

      const result = await jwtStorageService.has({ jti })

      expect(result).toBe(false)
    })
  })
})
