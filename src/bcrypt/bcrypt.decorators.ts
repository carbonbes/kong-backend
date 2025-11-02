import { Inject } from '@nestjs/common'
import { BCRYPT_MODULE_OPTIONS } from './consts'

export const InjectOptions = () => Inject(BCRYPT_MODULE_OPTIONS)
