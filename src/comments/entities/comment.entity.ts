import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  VirtualColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { Article } from '@/articles/entities'
import type { JSONContent } from '@tiptap/core'
import { BaseEntity } from '@/shared/typeorm/entities'

@Entity('comments')
@Index(['authorId', 'articleId', 'parentCommentId'])
export class Comment extends BaseEntity {
  @Column()
  authorId: number

  @ManyToOne(() => User, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  author: User

  @Column()
  articleId: number

  @ManyToOne(() => Article, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  article: Article

  @Column({ type: 'int', nullable: true, default: null })
  parentCommentId?: number | null

  @Column({ type: 'jsonb' })
  content: JSONContent

  @Column({ type: 'int', default: 0 })
  rating: number

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "comments" WHERE "parentCommentId" = ${alias}.id`,
  })
  childrenCount: number
}
