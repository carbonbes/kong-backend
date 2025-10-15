import { createClient, RedisClientType } from 'redis'

export interface ConfigModuleOptions {
  url: string
}

export type RedisClient = ReturnType<typeof createClient>

export type SetOptions = Parameters<RedisClientType['set']>
export type GetOptions = Parameters<RedisClientType['get']>
export type SAddOptions = Parameters<RedisClientType['sAdd']>
export type SMembersOptions = Parameters<RedisClientType['sMembers']>
