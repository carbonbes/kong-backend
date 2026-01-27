import { DynamicModule, Module, Provider } from '@nestjs/common'
import { NanoidService } from './nanoid.service'
import { NANOID_MODULE_OPTIONS } from '@/shared/nanoid/nanoid.consts'
import { NanoidModuleAsyncOptions } from '@/shared/nanoid/nanoid.types'

@Module({})
export class NanoidModule {
  static registerAsync(options: NanoidModuleAsyncOptions): DynamicModule {
    const module = NanoidModule

    const providers: Provider[] = [
      NanoidService,
      {
        provide: NANOID_MODULE_OPTIONS,
        inject: options.inject,
        useFactory: options.useFactory,
      },
    ]

    const exports: Provider[] = [NanoidService]

    return {
      module,
      providers,
      exports,
    }
  }
}
