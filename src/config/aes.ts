import { registerAs } from '@nestjs/config'

export default registerAs('aes', () => ({
  key: process.env.AES_KEY,
}))
