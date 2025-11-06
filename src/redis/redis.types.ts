import { RedisClientOptions, RedisClientType } from 'redis'
import { FactoryProvider } from '@nestjs/common'

export interface RedisModuleOptions extends RedisClientOptions {
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions
  inject?: FactoryProvider['inject']
}

export type RedisClient = RedisClientType
