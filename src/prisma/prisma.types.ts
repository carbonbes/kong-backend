import { FactoryProvider } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'

type PrismaPgConstructorArgs = ConstructorParameters<typeof PrismaPg>

export interface PrismaModuleOptions {
  useFactory?: (
    ...args: any[]
  ) => Promise<PrismaPgConstructorArgs> | PrismaPgConstructorArgs
  inject?: FactoryProvider['inject']
}
