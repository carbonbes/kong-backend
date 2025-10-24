import { Uuid } from '../types/uuid.type'

export const getUuid = (): Uuid => crypto.randomUUID()

export default getUuid
