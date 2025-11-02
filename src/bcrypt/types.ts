import { FactoryProvider } from '@nestjs/common'

export interface BcryptModuleOptions {
  saltOrRounds: number
}

export interface BcryptModuleAsyncOptions {
  inject?: FactoryProvider['inject']
  useFactory?: (
    ...args: any[]
  ) => Promise<BcryptModuleOptions> | BcryptModuleOptions
}

export type HashOptions = { value: string }
export type CompareOptions = { value: string; encoded: string }
