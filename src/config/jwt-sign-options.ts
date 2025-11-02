import * as process from 'node:process'

export default () => ({
  accessJwtSecret: process.env.ACCESS_JWT_SECRET,
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET,
  accessJwtExpiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
  refreshJwtExpiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
})
