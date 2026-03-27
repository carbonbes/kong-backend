import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { Article } from '@/articles/entities'
import type { JSONContent } from '@tiptap/core'
import { CreateDateColumn, UpdateDateColumn } from '@/shared/typeorm/decorators'

@Entity()
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
  @Index()
  rate: number

  @CreateDateColumn()
  @Index()
  createdAt: number

  @UpdateDateColumn()
  updatedAt: number
}
