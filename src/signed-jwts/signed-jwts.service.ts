import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@/shared/redis/redis.utils'
import { Repository } from 'redis-om'
import { signedJwtSchema } from '@/signed-jwts/signed-jwts.schema'
import { JwtStorageService } from '@/shared/jwt-storage/jwt-storage.service'
import { StoragedJwt } from '@/shared/jwt-storage/jwt-storage.types'

@Injectable()
export class SignedJwtsService extends JwtStorageService {
  constructor(
    @InjectRepository(signedJwtSchema)
    repository: Repository<StoragedJwt>,
  ) {
    super(repository)
  }
}
