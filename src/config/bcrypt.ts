import * as process from 'node:process'

export default () => ({
  saltRounds: process.env.BCRYPT_SALT_ROUNDS,
})
