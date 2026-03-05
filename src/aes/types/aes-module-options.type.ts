import { CipherGCMTypes, CipherKey } from 'node:crypto'

export interface AesModuleOptions {
  algorithm: CipherGCMTypes
  key: CipherKey
}
