import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { AddOptions } from './signed-jwts.types'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../shared/types'

@Injectable()
export class SignedJwtsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  add(jwt: AddOptions) {
    const { jti, sub, exp } = this.jwtService.decode<JwtPayload>(jwt)

    const userId = sub.toString()

    return this.redisService.hSet(userId, { jti, exp })
  }

  get() {}

  has() {}
}
