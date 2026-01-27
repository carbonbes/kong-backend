import { FactoryProvider } from '@nestjs/common'

export interface BcryptModuleOptions {
  rounds: number
}

export interface BcryptModuleAsyncOptions {
  inject: FactoryProvider['inject']
  useFactory: (
    ...args: any[]
  ) => Promise<BcryptModuleOptions> | BcryptModuleOptions
}

export type HashOptions = { value: string }
export type CompareOptions = { value: string; encoded: string }
