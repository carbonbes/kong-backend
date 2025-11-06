import { registerAs } from '@nestjs/config'

export default registerAs('jwt-sign-options', () => ({
  accessJwtSecret: process.env.ACCESS_JWT_SECRET,
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET,
  accessJwtExpiresIn: process.env.ACCESS_JWT_EXPIRES_IN,
  refreshJwtExpiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
}))
