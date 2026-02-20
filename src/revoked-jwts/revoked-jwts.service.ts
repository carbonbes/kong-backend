import { Injectable } from '@nestjs/common'
import { InjectRedisOmRepository } from '@/shared/redis-om/redis-om.decorators'
import { Repository } from 'redis-om'
import { revokedJwtSchema } from '@/revoked-jwts/revoked-jwts.schema'
import { JwtStorageService } from '@/shared/jwt-storage/jwt-storage.service'
import { StoragedJwt } from '@/shared/jwt-storage/jwt-storage.types'

@Injectable()
export class RevokedJwtsService extends JwtStorageService {
  constructor(
    @InjectRedisOmRepository(revokedJwtSchema)
    repository: Repository<StoragedJwt>,
  ) {
    super(repository)
  }
}
