import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/redis/utils'
import { Repository } from 'redis-om'
import { revokedJwtSchema } from '@/revoked-jwts/schema'
import { JwtStorageService } from '@/shared/jwt-storage/jwt-storage.service'
import { StorageJwt } from '@/shared/jwt-storage/types'

@Injectable()
export class RevokedJwtsService extends JwtStorageService {
  constructor(
    @InjectRepository(revokedJwtSchema)
    repository: Repository<StorageJwt>,
  ) {
    super(repository)
  }
}
