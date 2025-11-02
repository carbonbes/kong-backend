import * as process from 'node:process'

export default () => ({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  user: process.env.MAILER_USER,
  pass: process.env.MAILER_PASS,
})
