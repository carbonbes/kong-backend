import { Injectable } from '@nestjs/common'
import { customAlphabet } from 'nanoid'
import { NanoidModuleOptions } from '@/shared/nanoid/nanoid.types'
import { InjectNanoidModuleOptions } from '@/shared/nanoid/nanoid.utils'

@Injectable()
export class NanoidService {
  constructor(
    @InjectNanoidModuleOptions()
    private readonly options: NanoidModuleOptions,
  ) {}

  customAlphabet() {
    const { alphabet, defaultSize } = this.options.customAlphabet

    return customAlphabet(alphabet, defaultSize)()
  }
}
