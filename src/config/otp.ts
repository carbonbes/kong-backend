import * as process from 'node:process'

export default () => ({
  saltOrRounds: process.env.OTP_SALT_ROUNDS,
  expiresIn: process.env.OTP_EXPIRES_IN,
})
