import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { ArticleStatus } from '@/articles/enums'
import type { JSONContent } from '@tiptap/core'
import { CreateDateColumn, UpdateDateColumn } from '@/shared/typeorm/decorators'

@Entity('articles')
export class Article {
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

  @Column({ type: 'jsonb' })
  content: JSONContent

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.Draft })
  status: ArticleStatus

  @Column({ type: 'int', default: 0 })
  rating: number

  @CreateDateColumn()
  createdAt: number

  @UpdateDateColumn()
  updatedAt: number
}
