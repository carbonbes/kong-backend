import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { Article } from '@/articles/entities'
import type { JSONContent } from '@tiptap/core'

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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
