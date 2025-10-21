import { createClient, RedisClientOptions } from 'redis'

export type ConfigModuleOptions = RedisClientOptions

export type RedisClient = ReturnType<typeof createClient>
