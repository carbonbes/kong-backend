import { Injectable } from '@nestjs/common'
import { InjectRedisOmRepository } from '@/redis-om/decorators'
import { Repository } from 'redis-om'
import { revokedJwtSchema } from '@/revoked-jwts/schemas'
import { JwtStorageService } from '@/shared/jwt-storage/jwt-storage.service'
import { StoragedJwt } from '@/shared/jwt-storage/types'

@Injectable()
export class RevokedJwtsService extends JwtStorageService {
  constructor(
    @InjectRedisOmRepository(revokedJwtSchema)
    repository: Repository<StoragedJwt>,
  ) {
    super(repository)
  }
}
