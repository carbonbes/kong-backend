import { customAlphabet } from 'nanoid'

const getCode = () => +customAlphabet('0123456789', 6)()

export default getCode
