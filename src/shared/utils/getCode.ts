import { customAlphabet } from 'nanoid'

export const getCode = () => customAlphabet('0123456789', 6)()
