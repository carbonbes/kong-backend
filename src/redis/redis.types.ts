import { createClient, RedisClientOptions } from 'redis'

export type ConfigModuleOptions = RedisClientOptions

export type RedisClient = ReturnType<typeof createClient>

export type SetOptions = Parameters<RedisClient['set']>
export type GetOptions = Parameters<RedisClient['get']>
export type HSetOptions = Parameters<RedisClient['hSet']>
export type HGetOptions = Parameters<RedisClient['hGet']>
