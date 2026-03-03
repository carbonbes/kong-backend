import { Injectable } from '@nestjs/common'
import { InjectRedisOmRepository } from '@/redis-om/decorators'
import { Repository } from 'redis-om'
import { signedJwtSchema } from '@/signed-jwts/schemas'
import { JwtStorageService } from '@/shared/jwt-storage/jwt-storage.service'
import { StoragedJwt } from '@/shared/jwt-storage/types'

@Injectable()
export class SignedJwtsService extends JwtStorageService {
  constructor(
    @InjectRedisOmRepository(signedJwtSchema)
    repository: Repository<StoragedJwt>,
  ) {
    super(repository)
  }
}
