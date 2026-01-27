import { customAlphabet } from 'nanoid'
import { FactoryProvider } from '@nestjs/common'

type CustomAlphabetsOptions = {
  alphabet: Parameters<typeof customAlphabet>[0]
  defaultSize?: Parameters<typeof customAlphabet>[1]
}

export interface NanoidModuleOptions {
  customAlphabet: CustomAlphabetsOptions
}

export interface NanoidModuleAsyncOptions {
  inject: FactoryProvider['inject']
  useFactory: (
    ...args: any[]
  ) => Promise<NanoidModuleOptions> | NanoidModuleOptions
}
