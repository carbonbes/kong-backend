import { EntityId, Repository } from 'redis-om'
import {
  AddOptions,
  GetAllByUserOptions,
  GetOneOptions,
  HasOptions,
  StoragedJwt,
} from './jwt-storage.types'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/shared/redis/redis.utils'
import { jwtStorageSchema } from '@/jwt-storage/jwt-storage.schema'

@Injectable()
export class JwtStorageService {
  constructor(
    @InjectRepository(jwtStorageSchema)
    private readonly repository: Repository<StoragedJwt>,
  ) {}

  async add({ jti, sub, typ, exp }: AddOptions) {
    const jwt = await this.repository.save({ jti, sub, typ })
    const jwtId = jwt[EntityId]

    const expirationDate = new Date(exp * 1000)

    await this.repository.expireAt(jwtId, expirationDate)

    return jwt
  }

  getOne({ jti }: GetOneOptions) {
    return this.repository.search().where('jti').eq(jti).returnFirst()
  }

  getAllByUser({ sub }: GetAllByUserOptions) {
    return this.repository.search().where('sub').eq(sub).returnAll()
  }

  async has({ jti }: HasOptions) {
    return !!(await this.getOne({ jti }))
  }
}
