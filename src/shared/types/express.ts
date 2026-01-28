import { User } from '@/users/users.types'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}
