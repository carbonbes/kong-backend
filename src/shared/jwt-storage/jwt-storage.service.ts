import { EntityId, Repository } from 'redis-om'
import {
  AddOptions,
  GetOneOptions,
  GetAllOptions,
  HasOptions,
  StoragedJwt,
} from './jwt-storage.types'

export abstract class JwtStorageService {
  protected constructor(private readonly repository: Repository<StoragedJwt>) {}

  async add({ jti, sub, exp }: AddOptions) {
    const jwt = await this.repository.save({ jti, sub })
    const jwtId = jwt[EntityId]
    const jwtExpirationDate = new Date(exp * 1000)

    await this.repository.expireAt(jwtId, jwtExpirationDate)

    return jwt
  }

  getOne({ jti }: GetOneOptions) {
    return this.repository.search().where('jti').eq(jti).returnFirst()
  }

  getAll({ sub }: GetAllOptions) {
    return this.repository.search().where('sub').eq(sub).returnAll()
  }

  async has({ jti }: HasOptions) {
    return !!(await this.getOne({ jti }))
  }
}
