import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { OtpType } from '../enum'
import { User } from '../../users/entity'

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  otp: number

  @Column({ type: 'enum', enum: OtpType })
  type: OtpType

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'timestamp' })
  expiresAt: Date
}
