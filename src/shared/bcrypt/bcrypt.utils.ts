import { Inject } from '@nestjs/common'
import { BCRYPT_MODULE_OPTIONS } from '@/shared/bcrypt/bcrypt.consts'

export const InjectBcryptModuleOptions = () => Inject(BCRYPT_MODULE_OPTIONS)
