import { registerAs } from '@nestjs/config'

export default registerAs('otp', () => ({
  alphabet: process.env.OTP_CODE_NANOID_ALPHABET,
  defaultSize: process.env.OTP_CODE_NANOID_DEFAULT_SIZE,
  rounds: process.env.OTP_CODE_BCRYPT_ROUNDS,
  expiresIn: process.env.OTP_EXPIRES_IN,
}))
