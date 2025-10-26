import { EntityId, Repository } from 'redis-om'
import {
  AddOptions,
  GetAllOptions,
  GetOptions,
  HasOptions,
  StorageJwt,
} from './types'

export abstract class JwtStorageService {
  protected constructor(private readonly repository: Repository<StorageJwt>) {}

  async add({ jti, sub, exp }: AddOptions) {
    const storageJwt = await this.repository.save({ jti, sub })

    await this.repository.expire(storageJwt[EntityId], exp)

    return storageJwt
  }

  get({ jti }: GetOptions) {
    return this.repository.search().where('jti').equals(jti).returnFirst()
  }

  getAll({ sub }: GetAllOptions) {
    return this.repository.search().where('sub').equals(sub).returnAll()
  }

  async has({ jti }: HasOptions) {
    return !!(await this.get({ jti }))
  }
}
