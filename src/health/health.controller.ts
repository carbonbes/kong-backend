import { Controller, Get, Inject } from '@nestjs/common'
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus'
import { Public } from '@/shared/decorators'
import type { PrismaClient } from '@/prisma/types'
import { PRISMA_CLIENT } from '@/prisma/consts'
import { RedisHealthIndicator } from '@/health/redis.health'

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly db: PrismaHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    @Inject(PRISMA_CLIENT)
    private readonly prisma: PrismaClient,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('http', 'https://docs.nestjs.com'),
      () => this.db.pingCheck('database', this.prisma),
      () => this.redis.isHealthy(),
      () => this.memory.checkHeap('memory', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ])
  }
}
