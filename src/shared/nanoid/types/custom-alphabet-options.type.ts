import { customAlphabet } from 'nanoid'

export type CustomAlphabetOptions = {
  alphabet: Parameters<typeof customAlphabet>[0]
  defaultSize?: Parameters<typeof customAlphabet>[1]
}
