import 'dotenv/config'
import dotenv from 'dotenv'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'
import { USER_EXIST_AND_ACTIVE, USER_EXIST_AND_NOT_ACTIVE } from '@/test/consts'

dotenv.config({ path: '.env.test' })

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.create({
    data: { email: USER_EXIST_AND_NOT_ACTIVE, name: 'Test', gender: 'MALE' },
  })

  await prisma.user.create({
    data: { email: USER_EXIST_AND_ACTIVE, name: 'Test', gender: 'MALE' },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
