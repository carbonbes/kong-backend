import { DataSource } from 'typeorm'
import { User } from '@/users/entities'

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  migrations: [__dirname + '/migration/**/*{.js,.ts}'],
})

export default dataSource
