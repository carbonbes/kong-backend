import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { Article } from '@/articles/entities'
import type { JSONContent } from '@tiptap/core'
import { CreateDateColumn, UpdateDateColumn } from '@/shared/typeorm/decorators'

@Entity('comments')
@Index(['authorId', 'articleId', 'parentCommentId'])
export class Comment {
  @PrimaryGeneratedColumn()
  id: number

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

  @CreateDateColumn()
  createdAt: number

  @UpdateDateColumn()
  updatedAt: number
}
