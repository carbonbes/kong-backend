import { Uuid } from '@/shared/uuid/uuid.types'

export const getFakeUuid = (): Uuid => crypto.randomUUID()
