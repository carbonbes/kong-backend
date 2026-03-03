import { User } from '@/users/types'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}
