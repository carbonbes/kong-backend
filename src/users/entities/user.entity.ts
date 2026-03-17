import { defineEntity, p } from '@mikro-orm/core'
import { UserGender, UserRole } from '@/users/enums'

export const UserSchema = defineEntity({
  name: 'User',
  properties: {
    id: p.integer().primary(),
    email: p.string(),
    name: p.string(),
    gender: p.enum(() => UserGender),
    role: p.enum(() => UserRole).default(UserRole.User),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
})
