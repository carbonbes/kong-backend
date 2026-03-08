import { registerAs } from '@nestjs/config'

export default registerAs('otp', () => ({
  secret: process.env.OTP_SECRET,
  alphabet: process.env.OTP_ALPHABET,
  size: process.env.OTP_SIZE,
  expiresIn: process.env.OTP_EXPIRES_IN,
}))
