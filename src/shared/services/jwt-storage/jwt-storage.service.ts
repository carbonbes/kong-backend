import { EntityId, Repository } from 'redis-om'
import {
  AddOptions,
  GetAllOptions,
  GetOptions,
  HasOptions,
  StoragedJwt,
} from './types'

export abstract class JwtStorageService {
  protected constructor(private readonly repository: Repository<StoragedJwt>) {}

  async add({ jti, sub, exp }: AddOptions) {
    const jwt = await this.repository.save({ jti, sub })
    const jwtId = jwt[EntityId]

    await this.repository.expire(jwtId, exp)

    return jwt
  }

  get({ jti }: GetOptions) {
    return this.repository.search().where('jti').eq(jti).returnFirst()
  }

  getAll({ sub }: GetAllOptions) {
    return this.repository.search().where('sub').eq(sub).returnAll()
  }

  async has({ jti }: HasOptions) {
    return !!(await this.get({ jti }))
  }
}
