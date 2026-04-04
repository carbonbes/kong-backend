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
import { ArticleStatus } from '@/articles/enums'
import type { JSONContent } from '@tiptap/core'
import { Subsite } from '@/subsites/entities'

@Entity('articles')
export class Article {
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

  @Column({ type: 'int', nullable: true, default: null })
  subsiteId?: number | null

  @ManyToOne(() => Subsite, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subsiteId' })
  subsite: Subsite

  @Column({ type: 'jsonb' })
  content: JSONContent

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.Draft })
  status: ArticleStatus

  @Column({ type: 'int', default: 0 })
  rating: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
