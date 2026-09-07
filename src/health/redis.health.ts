import { Inject, Injectable } from '@nestjs/common'
import { HealthIndicatorService } from '@nestjs/terminus'
import type { RedisClient } from '@/redis-om/types'
import { REDIS_CLIENT } from '@/redis-om/consts'

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(REDIS_CLIENT)
    private readonly redis: RedisClient,
  ) {}

  async isHealthy() {
    const indicator = this.healthIndicatorService.check('redis')
    const response = await this.redis.ping()

    if (response !== 'PONG') {
      return indicator.down()
    }

    return indicator.up()
  }
}
