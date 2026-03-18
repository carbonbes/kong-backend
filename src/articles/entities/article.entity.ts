import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { ArticleStatus } from '@/articles/enums'
import { JSONContent } from '@tiptap/core'

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.id, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  author: User

  @Column({ type: 'jsonb' })
  content: JSONContent[]

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
