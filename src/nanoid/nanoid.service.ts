import { Injectable } from '@nestjs/common'
import { customAlphabet } from 'nanoid'
import {
  CustomAlphabetReturn,
  type NanoidModuleOptions,
} from '@/nanoid/types'
import { InjectNanoidModuleOptions } from '@/nanoid/decorators'

@Injectable()
export class NanoidService {
  constructor(
    @InjectNanoidModuleOptions()
    private readonly options: NanoidModuleOptions,
  ) {}

  customAlphabet(): CustomAlphabetReturn {
    const { alphabet, defaultSize } = this.options.customAlphabet

    return customAlphabet(alphabet, defaultSize)()
  }
}
