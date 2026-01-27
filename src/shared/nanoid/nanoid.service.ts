import { Inject, Injectable } from '@nestjs/common'
import { customAlphabet } from 'nanoid'
import { NANOID_MODULE_OPTIONS } from '@/shared/nanoid/nanoid.consts'
import { NanoidModuleOptions } from '@/shared/nanoid/nanoid.types'

@Injectable()
export class NanoidService {
  constructor(
    @Inject(NANOID_MODULE_OPTIONS)
    private readonly options: NanoidModuleOptions,
  ) {}

  customAlphabet() {
    const { alphabet, defaultSize } = this.options.customAlphabet

    return customAlphabet(alphabet, defaultSize)()
  }
}
