import * as bcrypt from 'bcrypt'

type CreateFakeBcryptHashOptions = {
  value: string
  rounds?: number
}

export const createFakeBcryptHash = ({
  value,
  rounds = 10,
}: CreateFakeBcryptHashOptions) => {
  return bcrypt.hash(value, rounds)
}
