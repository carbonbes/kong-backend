import { Injectable } from '@nestjs/common'
import {
  AddOptions,
  GetAllOptions,
  GetOptions,
  RevokedJwt,
} from './revoked-jwts.types'
import { InjectRepository } from '@/redis/redis.decorators'
import { Repository } from 'redis-om'
import { revokedJwtSchema } from '@/revoked-jwts/revoked-jwts.schema'

@Injectable()
export class RevokedJwtsService {
  constructor(
    @InjectRepository(revokedJwtSchema)
    private readonly repository: Repository<RevokedJwt>,
  ) {}

  add(jwt: AddOptions) {
    return this.repository.save(jwt)
  }

  get({ jti, sub }: GetOptions) {
    return this.repository
      .search()
      .where('jti')
      .equals(jti)
      .and('sub')
      .equals(sub)
      .returnFirst()
  }

  getAll({ sub }: GetAllOptions) {
    return this.repository.search().where('sub').equals(sub).returnAll()
  }
}
