import * as process from 'node:process'

export default () => ({
  url: process.env.REDIS_URL,
})
