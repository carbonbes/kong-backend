import { registerAs } from '@nestjs/config'

export default registerAs('otp', () => ({
  secret: process.env.OTP_SECRET,
  expiresIn: process.env.OTP_EXPIRES_IN,
}))
