import { Inject } from '@nestjs/common'
import { MODULE_OPTIONS_TOKEN } from '@/bcrypt/bcrypt.module-definition'

export const InjectBcryptModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
