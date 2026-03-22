import { User } from '@/users/entities'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}
