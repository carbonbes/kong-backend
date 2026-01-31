import { FactoryProvider } from '@nestjs/common'

export * from 'generated/prisma/client'

type PrismaPgOptions = { connectionString?: string }

export interface PrismaModuleOptions extends PrismaPgOptions {
  useFactory?: (
    ...args: any[]
  ) => Promise<PrismaModuleOptions> | PrismaModuleOptions
  inject?: FactoryProvider['inject']
}
