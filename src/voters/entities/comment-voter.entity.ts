import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseVoter } from '@/voters/entities/shared'
import { Comment } from '@/comments/entities'

@Entity()
export class CommentVoter extends BaseVoter {
  @Column()
  commentId: number

  @ManyToOne(() => Comment, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn()
  comment: Comment
}
