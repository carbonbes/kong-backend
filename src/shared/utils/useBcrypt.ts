import * as bcrypt from 'bcrypt'

export type GetHashOptions = { value: string }
export type CompareOptions = { value: string; hash: string }

export const getHash = ({ value }: GetHashOptions) => {
  const rounds = process.env.BCRYPT_SALT_ROUNDS

  return bcrypt.hash(value, rounds)
}

export const compare = ({ value, hash }: CompareOptions) => {
  return bcrypt.compare(value, hash)
}
