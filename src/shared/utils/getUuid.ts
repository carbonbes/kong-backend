import { Uuid } from '../types'

export const getUuid = (): Uuid => crypto.randomUUID()
