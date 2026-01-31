import * as bcrypt from 'bcrypt'

type GetFakeBcryptHashOptions = {
  value: string
  rounds?: number
}

export const getFakeBcryptHash = ({
  value,
  rounds = 10,
}: GetFakeBcryptHashOptions) => {
  return bcrypt.hash(value, rounds)
}
