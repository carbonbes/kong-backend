import * as process from 'node:process'

export default () => ({
  url: process.env.DATABASE_URL,
})
