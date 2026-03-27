import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '@/users/entities'
import { CreateDateColumn } from '@/shared/typeorm/decorators'

@Entity()
export abstract class BaseVoter {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @ManyToOne(() => User)
  @JoinColumn()
  user: User

  @Column()
  value: number

  @CreateDateColumn()
  createdAt: number
}
