import { FactoryProvider, ModuleMetadata, Provider, Type } from '@nestjs/common'
import PG from 'pg/index'
import PoolConfig = PG.PoolConfig

export * from 'generated/prisma/client'

export type PrismaModuleOptions = PoolConfig

export interface PrismaOptionsFactory {
  createPrismaOptions(): Promise<PrismaModuleOptions> | PrismaModuleOptions
}

export interface PrismaModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  useExisting?: Type<PrismaOptionsFactory>
  useClass?: Type<PrismaOptionsFactory>
  useFactory?: (
    ...args: any[]
  ) => Promise<PrismaModuleOptions> | PrismaModuleOptions
  inject?: FactoryProvider['inject']
  extraProviders?: Provider[]
}
