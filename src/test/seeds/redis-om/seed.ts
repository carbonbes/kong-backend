import { createClient } from 'redis'
import { Repository } from 'redis-om'

const url = process.env.REDIS_URL
const redis = createClient({ url })

async function main() {
  await redis.connect()

  const repository = new Repository(schema, redis)
  await repository.createIndex()
}

main()
