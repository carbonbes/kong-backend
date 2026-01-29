import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/shared/redis/redis.utils'
import { Repository } from 'redis-om'
import { revokedJwtSchema } from '@/revoked-jwts/revoked-jwts.schema'
import { JwtStorageService } from '@/shared/jwt-storage/jwt-storage.service'
import { StoragedJwt } from '@/shared/jwt-storage/jwt-storage.types'

@Injectable()
export class RevokedJwtsService extends JwtStorageService {
  constructor(
    @InjectRepository(revokedJwtSchema)
    repository: Repository<StoragedJwt>,
  ) {
    super(repository)
  }
}
