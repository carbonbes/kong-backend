import { Uuid } from '@/shared/uuid/types'

export const getFakeUuid = (): Uuid => crypto.randomUUID()
