import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { ArticleStatus } from '@/articles/enums'
import type { JSONContent } from '@tiptap/core'

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  author: User

  @Column({ type: 'jsonb' })
  content: JSONContent

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.Draft })
  status: ArticleStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
