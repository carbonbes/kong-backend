import { User as UserType, UserGender, UserRole } from '@/users/types'

export class User implements UserType {
  name: string
  id: number
  email: string
  gender: UserGender
  role: UserRole
  isActive: boolean
  createdAt: Date
}
