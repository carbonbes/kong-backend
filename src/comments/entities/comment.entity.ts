import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
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

  @OneToOne(() => User, (user) => user.id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  author: User

  @OneToOne(() => Article, (article) => article.id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  article: Article

  @Column({ type: 'jsonb' })
  content: JSONContent

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
