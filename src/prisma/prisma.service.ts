import { Injectable } from '@nestjs/common'
import { PrismaClient } from 'generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { InjectPrismaModuleOptions } from '@/prisma/decorators'
import { type PrismaModuleOptions } from '@/prisma/types'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    @InjectPrismaModuleOptions() private readonly options: PrismaModuleOptions,
  ) {
    const adapter = new PrismaPg(options)

    super({ adapter })
  }
}
