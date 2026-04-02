import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { User } from '@/users/entities'
import { ArticleStatus } from '@/articles/enums'
import type { JSONContent } from '@tiptap/core'
import { BaseEntity } from '@/shared/typeorm/entities'

@Entity()
export class Article extends BaseEntity {
  @Column()
  authorId: number

  @ManyToOne(() => User, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  author: User

  @Column({ type: 'jsonb' })
  content: JSONContent

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.Draft })
  status: ArticleStatus
}
