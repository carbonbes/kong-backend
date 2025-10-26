import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/shared/decorators/repository.decorator'
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
