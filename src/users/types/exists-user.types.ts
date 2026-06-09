import { ExistsOptions, ExistsReturn } from '@/prisma/types'
import { UserDelegate } from './user-delegate.type'

export type ExistsUserOptions = ExistsOptions<UserDelegate>
export type ExistsUserReturn = ExistsReturn
