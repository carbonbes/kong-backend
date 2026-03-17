import { InferEntity } from '@mikro-orm/core'
import { UserSchema } from '@/users/entities'

export type User = InferEntity<typeof UserSchema>
