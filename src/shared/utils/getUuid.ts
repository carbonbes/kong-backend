import { Uuid } from '@/shared/types'

export const getUuid = (): Uuid => crypto.randomUUID()

export default getUuid
