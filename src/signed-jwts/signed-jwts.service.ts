import { Injectable } from '@nestjs/common'
import { InjectRedisOmRepository } from '@/shared/redis-om/redis-om.decorators'
import { Repository } from 'redis-om'
import { signedJwtSchema } from '@/signed-jwts/signed-jwts.schema'
import { JwtStorageService } from '@/shared/jwt-storage/jwt-storage.service'
import { StoragedJwt } from '@/shared/jwt-storage/jwt-storage.types'

@Injectable()
export class SignedJwtsService extends JwtStorageService {
  constructor(
    @InjectRedisOmRepository(signedJwtSchema)
    repository: Repository<StoragedJwt>,
  ) {
    super(repository)
  }
}
