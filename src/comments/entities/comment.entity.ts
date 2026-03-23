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
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User

  @Column()
  articleId: number

  @ManyToOne(() => Article, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId' })
  article: Article

  @Column({ nullable: true })
  parentCommentId: number | null

  @Column({ type: 'jsonb' })
  content: JSONContent

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
