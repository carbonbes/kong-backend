import { RedisClientOptions, RedisClientType } from 'redis'
import { FactoryProvider, ModuleMetadata, Provider, Type } from '@nestjs/common'

export type RedisModuleOptions = RedisClientOptions

export interface RedisOptionsFactory {
  createRedisOptions(): Promise<RedisModuleOptions> | RedisModuleOptions
}

export interface RedisModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  useExisting?: Type<RedisOptionsFactory>
  useClass?: Type<RedisOptionsFactory>
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions
  inject?: FactoryProvider['inject']
  extraProviders?: Provider[]
}

export type RedisClient = RedisClientType
