import { defineEntity, p } from '@mikro-orm/core'
import { UserSchema } from '@/users/entities'

export const ArticleSchema = defineEntity({
  name: 'Article',
  properties: {
    id: p.integer().primary(),
    author: () => p.manyToOne(UserSchema),
    content: p.json(),
  },
})
