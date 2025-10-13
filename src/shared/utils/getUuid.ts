import { Uuid } from '../types'

const getUuid = (): Uuid => crypto.randomUUID()

export default getUuid
