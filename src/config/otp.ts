import { registerAs } from '@nestjs/config'

export default registerAs('otp', () => ({
  alphabet: process.env.OTP_ALPHABET,
  size: process.env.OTP_SIZE,
  hashRounds: process.env.OTP_HASH_ROUNDS,
  expiresIn: process.env.OTP_EXPIRES_IN,
}))
