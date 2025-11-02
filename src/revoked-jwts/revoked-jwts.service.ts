import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/redis/utils'
import { Repository } from 'redis-om'
import { revokedJwtSchema } from '@/revoked-jwts/schema'
import { JwtStorageService } from '@/shared/services/jwt-storage/jwt-storage.service'
import { StoragedJwt } from '@/shared/services/jwt-storage/types'

@Injectable()
export class RevokedJwtsService extends JwtStorageService {
  constructor(
    @InjectRepository(revokedJwtSchema)
    repository: Repository<StoragedJwt>,
  ) {
    super(repository)
  }
}
